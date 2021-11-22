#!/usr/bin/env ts-node-script

import axios from 'axios';
import express from 'express';
import { $, cd, fs } from 'zx';

import { getConfig } from './config';
import {
  spServeDrupalLogFile,
  spServeGatsbyLogFile,
  spServePort,
  testTypes,
} from './constants';
import { Awaited, EnvVars, TestType } from './types';
import {
  getEnvVars,
  log,
  port,
  runDetached,
  UnreachableCaseError,
} from './utils';
import { waitForGatsby } from './wait-for-gatsby';

const commands = ['start', 'reset', 'stop'] as const;
type Command = typeof commands[number];

const state = {
  appDirs: '',
  'drupal-only': false,
  'gatsby-develop': false,
  'gatsby-build': false,

  isRunning: async (testType: TestType): Promise<boolean> => {
    const config = getConfig();
    const map: Record<TestType, number> = {
      'drupal-only': config.drupal.port,
      'gatsby-develop': config.gatsby.developPort,
      'gatsby-build': config.gatsby.rebuildPort,
    };
    return state[testType] || (await port.check(map[testType]));
  },
};

const setEnvVars = (envVars: EnvVars) => {
  for (const key in envVars) {
    process.env[key] = envVars[key as keyof EnvVars];
  }
  $.verbose = !!envVars.SP_VERBOSE;
};

void (async function () {
  const handlers: Record<
    TestType,
    Record<
      Command,
      (
        config: Awaited<ReturnType<typeof getConfig>>,
        envVars: EnvVars,
      ) => Promise<void>
    >
  > = {
    'drupal-only': {
      start: async (config) => {
        log('drupal-only-start start');

        cd(config.drupal.path);

        if (fs.existsSync(`${config.drupal.path}/.silverback-snapshots/test`)) {
          await $`yarn snapshot-restore`;
        } else {
          await $`yarn setup`;
          await $`yarn snapshot-create`;
        }

        await port.killIfUsed(config.drupal.port);
        await runDetached({
          workDir: config.drupal.path,
          command: 'TEST_SESSION_ENABLED=true yarn start',
          logFile: spServeDrupalLogFile,
        });
        await port.waitUntilUsed(config.drupal.port);
        state['drupal-only'] = true;

        log('drupal-only-start end');
      },

      reset: async (config) => {
        log('drupal-only-reset start');

        cd(config.drupal.path);
        await $`yarn snapshot-restore`;

        log('drupal-only-reset end');
      },

      stop: async (config) => {
        log('drupal-only-stop start');
        await port.killIfUsed(config.drupal.port);
        state['drupal-only'] = false;
        log('drupal-only-stop end');
      },
    },

    'gatsby-develop': {
      start: async (config, envVars) => {
        log('gatsby-develop-start start');

        await port.killIfUsed([
          config.gatsby.buildPort,
          config.gatsby.rebuildPort,
        ]);

        await handlers['drupal-only']['start'](config, envVars);

        cd(config.gatsby.path);
        await $`yarn clean`;
        await runDetached({
          workDir: config.gatsby.path,
          command:
            // Load env vars right before starting Gatsby so that it sees them.
            'source .envrc && yarn develop',
          logFile: spServeGatsbyLogFile,
          // Wait until Gatsby outputs
          //   You can now view {your app} in the browser.
          //   http://localhost:8000/
          // Before this happens, it's really dangerous to touch Gatsby. It can
          // crash.
          waitForOutput: config.gatsby.baseUrl,
        });
        state['gatsby-develop'] = true;

        log('gatsby-develop-start end');
      },

      reset: async (config, envVars) => {
        log('gatsby-develop-reset start');

        await handlers['drupal-only']['reset'](config, envVars);
        try {
          await axios.post(
            `${config.gatsby.baseUrl}/__refresh`,
            {
              // This triggers full content fetch.
              buildId: 0,
            },
            {
              timeout: config.gatsby.timings.httpCallTimeout,
            },
          );
        } catch (e) {
          // Can happen if Gatsby is starting. Does not make sense to report.
        }
        await waitForGatsby();

        log('gatsby-develop-reset end');
      },

      stop: async (config, envVars) => {
        log('gatsby-develop-stop start');
        await handlers['drupal-only']['stop'](config, envVars);
        await port.killIfUsed(config.gatsby.developPort);
        state['gatsby-develop'] = false;
        log('gatsby-develop-stop end');
      },
    },

    'gatsby-build': {
      start: async (config, envVars) => {
        log('gatsby-build-start start');

        await port.killIfUsed(config.gatsby.developPort);

        await handlers['drupal-only']['start'](config, envVars);

        cd(config.gatsby.path);
        await $`yarn clean`;
        await runDetached({
          workDir: config.gatsby.path,
          command:
            // Load env vars right before starting Gatsby so that it sees them.
            'source .envrc && yarn fast-builds:serve:local',
          logFile: spServeGatsbyLogFile,
        });

        await port.waitUntilUsed(
          config.gatsby.port,
          config.gatsby.timings.retryInterval,
          config.gatsby.timings.startTimeout,
        );

        state['gatsby-build'] = true;

        log('gatsby-build-start end');
      },

      reset: async (config, envVars) => {
        log('gatsby-build-reset start');

        await handlers['drupal-only']['reset'](config, envVars);
        await axios.post(config.gatsby.fastBuilds.rebuildUrl);
        await waitForGatsby();

        log('gatsby-build-reset end');
      },

      stop: async (config, envVars) => {
        log('gatsby-build-stop start');
        await handlers['drupal-only']['stop'](config, envVars);
        await port.killIfUsed([
          config.gatsby.buildPort,
          config.gatsby.rebuildPort,
        ]);
        state['gatsby-build'] = false;
        log('gatsby-build-stop end');
      },
    },
  };

  const app = express();
  app.use(express.json());

  for (const testType of testTypes) {
    for (const command of commands) {
      app.post(`/${testType}-${command}`, async (req, res) => {
        log(`sp-serve request: /${testType}-${command}`);
        const envVars: EnvVars = req.body;
        setEnvVars(envVars);
        const config = getConfig();
        const appDirs = config.drupal.path + config.gatsby.path;
        const handler = handlers[testType];
        switch (command) {
          case 'start':
            if (state.appDirs !== appDirs) {
              state.appDirs = appDirs;
              if (await state.isRunning(testType)) {
                await handler.stop(config, envVars);
              }
            }
            if (await state.isRunning(testType)) {
              await handler.reset(config, envVars);
            } else {
              await handler.start(config, envVars);
            }
            break;
          case 'reset':
            if (state.appDirs !== appDirs) {
              state.appDirs = appDirs;
              if (await state.isRunning(testType)) {
                await handler.stop(config, envVars);
              }
            }
            if (await state.isRunning(testType)) {
              await handler.reset(config, envVars);
            } else {
              await handler.start(config, envVars);
            }
            break;
          case 'stop':
            if (state.appDirs !== appDirs) {
              state.appDirs = appDirs;
            }
            await handler.stop(config, envVars);
            state[testType] = false;
            break;
          default:
            throw new UnreachableCaseError(command);
        }
        res.sendStatus(200);
      });
    }
  }

  app.post('/stop', async (_, res) => {
    log(`sp-serve request: /stop`);
    for (const testType of testTypes) {
      await handlers[testType].stop(getConfig(), getEnvVars());
    }
    res.sendStatus(200);
    process.exit();
  });

  app.listen(spServePort, () => {
    console.log(`sp-serve is ready`);
  });
})();
