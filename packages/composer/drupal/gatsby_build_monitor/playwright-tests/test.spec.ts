import {
  drupal,
  drupalLogin,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-build Gatsby Build Monitor integration works', async ({
  page,
}) => {
  await drupalLogin(page);
  await page.goto(`${drupal.baseUrl}/admin`);

  // The test fails when GitHub CI is slow. So we increase the timeout.
  const readyTimeout = 40_000;

  await expect(page.locator('a:has-text("Website is ready")')).toBeVisible({
    timeout: readyTimeout,
  });

  await page.goto(`${drupal.baseUrl}/node/add/page`);
  await page.type('#edit-title-0-value', 'New page');
  await page.click('.cke_button__source');
  await page.type('textarea.cke_source', 'Body');
  await page.click('#edit-submit');

  await expect(page.locator('a:has-text("Website is building")')).toBeVisible();

  await waitForGatsby();

  await expect(page.locator('a:has-text("Website is ready")')).toBeVisible({
    timeout: readyTimeout,
  });

  await page.goto(`${drupal.baseUrl}/admin/reports/gatsby-build-logs`);
  expect(
    await page.locator('.view-gatsby-build-monitor-logs table td').count(),
  ).toBeGreaterThan(1);
});
