import { fs, path } from 'zx';

import {
  drupalPort,
  gatsbyBuildPort,
  gatsbyDevelopPort,
  gatsbyRebuildPort,
} from './constants';
import { getEnvVars } from './utils';

export const getConfig = () => {
  const envVars = getEnvVars();
  const configFile = path.resolve(envVars.SP_TEST_DIR, 'config.json');
  if (!fs.existsSync(configFile)) {
    throw new Error(
      `'config.json' file does not exists in '${envVars.SP_TEST_DIR}' directory.`,
    );
  }
  const packageConfig = JSON.parse(fs.readFileSync(configFile).toString());

  const gatsbyPort =
    envVars.SP_TEST_TYPE === 'gatsby-develop'
      ? gatsbyDevelopPort
      : gatsbyBuildPort;
  return {
    drupal: {
      path: path.resolve(envVars.SP_TEST_DIR, '..', packageConfig.drupal.path),
      port: drupalPort,
      baseUrl: `http://localhost:${drupalPort}`,
      adminUser: {
        login: 'admin',
        password: 'admin',
      },
    },
    gatsby: {
      path: path.resolve(envVars.SP_TEST_DIR, '..', packageConfig.gatsby.path),
      port: gatsbyPort,
      baseUrl: `http://localhost:${gatsbyPort}`,
      developPort: gatsbyDevelopPort,
      buildPort: gatsbyBuildPort,
      rebuildPort: gatsbyRebuildPort,
      allPorts: [gatsbyRebuildPort, gatsbyBuildPort, gatsbyDevelopPort],
      fastBuilds: {
        port: gatsbyRebuildPort,
        rebuildUrl: `http://localhost:${gatsbyRebuildPort}/__rebuild`,
      },
      timings: {
        startTimeout:
          envVars.SP_TEST_TYPE === 'gatsby-develop'
            ? packageConfig.gatsby.timings?.develop?.startTimeout || 30_000
            : packageConfig.gatsby.timings?.build?.startTimeout || 90_000,
        refreshTimeout:
          envVars.SP_TEST_TYPE === 'gatsby-develop'
            ? packageConfig.gatsby.timings?.develop?.refreshTimeout || 15_000
            : packageConfig.gatsby.timings?.build?.refreshTimeout || 30_000,
        retryInterval:
          envVars.SP_TEST_TYPE === 'gatsby-develop'
            ? packageConfig.gatsby.timings?.develop?.retryInterval || 500
            : packageConfig.gatsby.timings?.build?.retryInterval || 1_000,
        // When we get the fresh drupalBuildId from Gatsby, Gatsby still needs
        // additional time because the fact that we were able to get the build ID
        // does not mean that all other Gatsby tasks are done.
        finishDelay: 2_000,
        // If Gatsby is still building, requests might hang for long.
        httpCallTimeout: 1_000,
      },
    },
  };
};
