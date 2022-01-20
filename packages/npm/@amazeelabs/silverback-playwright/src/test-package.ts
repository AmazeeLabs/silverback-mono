#!/usr/bin/env node

import prompts from 'prompts';
import { $, cd } from 'zx';

import { getConfig } from './config';
import { tags, TestType, testTypes } from './test-types';
import { port } from './utils';

if (process.argv.includes('help') || process.argv.includes('--help')) {
  console.log(`Usage: yarn sp-test [flags]
  Flags:
    -v, --verbose    Spam a lot
    -h, --headed     Run tests in headed browser (default: headless)
    -r, --re-run     Allow quick re-run of failing tests
    -t, --trace      Record traces`);
  process.exit();
}

const headed = process.argv.includes('--headed') || process.argv.includes('-h');
const reRun = process.argv.includes('--re-run') || process.argv.includes('-r');
const verbose =
  process.argv.includes('--verbose') || process.argv.includes('-v');
const trace = process.argv.includes('--trace') || process.argv.includes('-t');

const testDir = `${process.cwd()}/playwright-tests`;

$.verbose = verbose;
// We escape args ourselves.
$.quote = (arg) => arg;

const runTests = async (type: TestType) => {
  const envVars: Record<string, string> = {
    SP_TEST_DIR: testDir,
    SP_TEST_TYPE: type,
    SP_VERBOSE: verbose ? 'true' : '',
    SP_TRACE: trace ? 'true' : '',
  };
  for (const k in envVars) {
    process.env[k] = envVars[k];
  }
  const envVarsString = Object.entries(envVars)
    .map(([k, v]) => `${k}='${v}'`)
    .join(' ');

  console.log(`⏩ Running ${type} tests...`);
  const listFlags = [
    `--grep '${tags[type]}'`,
    `--config '${__dirname}/playwright.config.js'`,
    '--list',
  ].join(' ');
  const listProcess = $`${envVarsString} yarn playwright test ${listFlags}`;
  if ((await listProcess.exitCode) === 0) {
    const globalSetup = (await import(`./${type}/global-setup`)).default;
    console.log('Preparing environment...');
    await globalSetup();

    cd(process.cwd());
    const runFlags = [
      `--grep '${tags[type]}'`,
      `--config '${__dirname}/playwright.config.js'`,
      '--workers 1', // Otherwise it can things in parallel.
      headed ? '--headed --timeout 6000000' : null,
      '--max-failures 1',
    ]
      .filter(Boolean)
      .join(' ');
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const runProcess =
        $`${envVarsString} yarn playwright test ${runFlags}`.pipe(
          process.stdout,
        );
      if ((await runProcess.exitCode) === 0) {
        break;
      }
      if (reRun) {
        const response = await prompts({
          type: 'confirm',
          name: 'confirm',
          message: 'Re-run?',
          initial: true,
        });
        if (response.confirm) {
          continue;
        }
      }
      console.error(`❌ ${type} tests failed.`);
      process.exit(1);
    }
    console.log(`✅ ${type} tests passed.`);
  } else {
    console.log(`☑️  No ${type} tests found.`);
  }
};

void (async function () {
  // Ensure browser is installed.
  await $`yarn playwright install chromium`;

  for (const type of testTypes) {
    await runTests(type);
  }

  console.log('ℹ️  Cleaning up...');
  const { drupal, gatsby } = getConfig();
  await port.killIfUsed(drupal.port);
  await port.killIfUsed(gatsby.allPorts);
  process.exit();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
