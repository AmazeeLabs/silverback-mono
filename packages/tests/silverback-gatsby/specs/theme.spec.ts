import { drupal, gatsby } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

import { getIframe } from '../../silverback-drupal/common';

test('silverback_iframe_test theme is used when iframe=true', async ({
  page,
}) => {
  await page.goto(`${gatsby.baseUrl}/en/form/for-testing-confirmation-options`);
  const iframe = await getIframe(page);
  await iframe.waitForSelector('body.silverback-iframe-test-theme-is-here');
});

test('silverback_iframe_test theme is not used when there is no iframe=true', async ({
  page,
}) => {
  await page.goto(`${drupal.baseUrl}/en/form/for-testing-confirmation-options`);
  let error = null;
  try {
    await page.waitForSelector('body.silverback-iframe-test-theme-is-here', {
      // We have to set a timeout here. Because if the global timeout will hit,
      // the test will fail even if we catch the error here.
      timeout: 2000,
    });
  } catch (e) {
    error = e;
  }
  expect(error).toBeTruthy();
});
