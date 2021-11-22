import axios from 'axios';

import { getConfig } from './config';
import { getEnvVars, log } from './utils';

export const waitForGatsby = async (): Promise<void> => {
  const testType = getEnvVars().SP_TEST_TYPE;
  const develop = testType === 'gatsby-develop';
  const config = getConfig();

  const deadline = Date.now() + config.gatsby.timings.startTimeout;

  log(`waitForGatsby[${deadline}] before call drupal`);
  const drupalResponse = await axios.post(
    `${config.drupal.baseUrl}/silverback-gatsby`,
    {
      operationName: 'GatsbyBuildId',
      variables: {},
      query: `
        query GatsbyBuildId {
          drupalBuildId
        }
      `,
    },
    {
      headers: develop
        ? {
            Authorization: `Basic ${Buffer.from(
              `${config.drupal.adminUser.login}:${config.drupal.adminUser.password}`,
            ).toString('base64')}`,
          }
        : {},
    },
  );

  const drupalBuildId = drupalResponse.data.data.drupalBuildId;
  log(`waitForGatsby[${deadline}] call drupal result: ${drupalBuildId}`);

  let gatsbyBuildId = -2;

  while (Date.now() < deadline) {
    // It makes sense to wait first because Gatsby is never instant.
    await new Promise((resolve) =>
      setTimeout(() => resolve(null), config.gatsby.timings.retryInterval),
    );

    const timeout = config.gatsby.timings.httpCallTimeout;
    try {
      if (develop) {
        log(`waitForGatsby[${deadline}] before call gatsby (develop)`);
        const gatsbyResponse = await axios.post(
          `${config.gatsby.baseUrl}/___graphql`,
          {
            operationName: 'GatsbyBuildId',
            variables: {},
            query: `
              query GatsbyBuildId {
                drupalBuildId
              }
            `,
          },
          {
            timeout,
          },
        );
        gatsbyBuildId = gatsbyResponse.data.data.drupalBuildId;
        log(
          `waitForGatsby[${deadline}] call gatsby (develop) result: ${gatsbyBuildId}`,
        );
      } else {
        log(`waitForGatsby[${deadline}] before call gatsby (build)`);
        const gatsbyResponse = await axios.get(
          `${config.gatsby.baseUrl}/build.json`,
          {
            timeout,
          },
        );
        gatsbyBuildId = gatsbyResponse.data.drupalBuildId;
        log(
          `waitForGatsby[${deadline}] call gatsby (develop) result: ${gatsbyBuildId}`,
        );
      }
    } catch (e) {
      // Can happen if Gatsby is starting. Does not make sense to report.
      log(`waitForGatsby[${deadline}] call gatsby failed`);
    }

    if (gatsbyBuildId === drupalBuildId) {
      log(`waitForGatsby[${deadline}] success`);
      await new Promise((resolve) =>
        setTimeout(() => resolve(null), config.gatsby.timings.finishDelay),
      );
      return;
    }
  }

  console.error(
    `⚠️ Warning: Waited ${config.gatsby.timings.startTimeout}ms, but Build ID did not get updated.`,
    { drupalBuildId, gatsbyBuildId },
  );
};
