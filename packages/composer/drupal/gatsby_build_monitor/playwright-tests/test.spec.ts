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

  await expect(page.locator('a:has-text("Website is ready")')).toBeVisible({
    // Gatsby can be still building when the test starts.
    // (waitForGatsby used in resetState only guarantees that Gatsby has the
    // same Build ID as Drupal. But the building process can still be running.)
    timeout: 20_000,
  });

  await page.goto(`${drupal.baseUrl}/node/add/page`);
  await page.type('#edit-title-0-value', 'New page');
  await page.click('.cke_button__source');
  await page.type('textarea.cke_source', 'Body');
  await page.click('#edit-submit');

  await expect(page.locator('a:has-text("Website is building")')).toBeVisible();

  await waitForGatsby();

  await expect(page.locator('a:has-text("Website is ready")')).toBeVisible();

  await page.goto(`${drupal.baseUrl}/admin/reports/gatsby-build-logs`);
  expect(
    await page.locator('.view-gatsby-build-monitor-logs table td').count(),
  ).toBeGreaterThan(1);
});
