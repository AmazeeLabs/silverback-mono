import axios from 'axios';

import { drupal, gatsby } from './constants';

const develop = process.env.SP_TEST_TYPE === 'gatsby-develop';

export const waitForGatsby = async (): Promise<void> => {
  const deadline = Date.now() + gatsby.timings.startTimeout;

  const drupalResponse = await axios.post(
    `${drupal.baseUrl}/silverback-gatsby`,
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
              `${drupal.adminUser.login}:${drupal.adminUser.password}`,
            ).toString('base64')}`,
          }
        : {},
    },
  );

  const drupalBuildId = drupalResponse.data.data.drupalBuildId;

  let gatsbyBuildId = -2;

  while (Date.now() < deadline) {
    // It makes sense to wait first because Gatsby is never instant.
    await new Promise((resolve) =>
      setTimeout(() => resolve(null), gatsby.timings.retryInterval),
    );

    let gatsbyResponse;
    const timeout = gatsby.timings.httpCallTimeout;
    try {
      if (develop) {
        gatsbyResponse = await axios.post(
          `${gatsby.baseUrl}/___graphql`,
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
      } else {
        gatsbyResponse = await axios.get(`${gatsby.baseUrl}/build.json`, {
          timeout,
        });
      }
      gatsbyBuildId = develop
        ? gatsbyResponse.data.data.drupalBuildId
        : gatsbyResponse.data.drupalBuildId;
    } catch (e) {
      // Can happen if Gatsby is starting. Does not make sense to report.
    }

    if (gatsbyBuildId === drupalBuildId) {
      await new Promise((resolve) =>
        setTimeout(() => resolve(null), gatsby.timings.finishDelay),
      );
      return;
    }
  }

  console.error(
    `⚠️ Warning: Waited ${gatsby.timings.startTimeout}ms, but Build ID did not get updated.`,
    { drupalBuildId, gatsbyBuildId },
  );
};
