import { gatsby, resetState } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

import { getIframe } from './common';

test.beforeAll(async () => {
  await resetState();
});

test.only('@gatsby-both links open in parent frame, using parent frame base url, without iframe=true param in the url', async ({
  page,
}) => {
  await page.goto(`${gatsby.baseUrl}/en/form/for-testing-confirmation-options`);
  const iframe = await getIframe(page);
  await iframe.waitForSelector('body.silverback-iframe-links-processed');
  await iframe.click(
    '.form-item-optional-text-field .webform-element-description a',
  );
  expect(
    [
      `${gatsby.baseUrl}/en/article/with-everything`,
      // For some reason, we have a trailing slash ih the URL in gatsby-build
      // mode. Would be nice to deal with it, but currently it is not critical.
      `${gatsby.baseUrl}/en/article/with-everything/`,
    ].includes(page.url()),
  ).toBeTruthy();
});
