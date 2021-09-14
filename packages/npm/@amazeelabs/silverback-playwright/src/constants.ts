import { path } from 'zx';

import { TestType } from './test-types';

const testType: TestType = process.env.SP_TEST_TYPE as TestType;

const drupalPort = 8888;
export const drupal = {
  path: path.resolve(`${__dirname}/../../../../../apps/silverback-drupal`),
  port: drupalPort,
  baseUrl: `http://localhost:${drupalPort}`,
  adminUser: {
    login: 'admin',
    password: 'admin',
  },
};

const gatsbyDevelopPort = 8000;
const gatsbyBuildPort = 9000;
const gatsbyRebuildPort = 9001;
const gatsbyPort =
  testType === 'gatsby-develop' ? gatsbyDevelopPort : gatsbyBuildPort;
export const gatsby = {
  path: path.resolve(`${__dirname}/../../../../../apps/silverback-gatsby`),
  port: gatsbyPort,
  baseUrl: `http://localhost:${gatsbyPort}`,
  allPorts: [gatsbyRebuildPort, gatsbyBuildPort, gatsbyDevelopPort],
  fastBuilds: {
    port: gatsbyRebuildPort,
    rebuildUrl: `http://localhost:${gatsbyRebuildPort}/__rebuild`,
  },
  timings: {
    startTimeout: testType === 'gatsby-develop' ? 30_000 : 60_000,
    refreshTimeout: testType === 'gatsby-develop' ? 15_000 : 30_000,
    retryInterval: testType === 'gatsby-develop' ? 500 : 1_000,
    // When we get the fresh drupalBuildId from Gatsby, Gatsby still needs
    // additional time because the fact that we were able to get the build ID
    // does not mean that all other Gatsby tasks are done.
    finishDelay: 2_000,
    // If Gatsby is still building, requests might hang for long.
    httpCallTimeout: 1_000,
  },
};
