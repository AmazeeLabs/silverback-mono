import {
  drupal,
  drupalLogin,
  resetState,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';
import os from 'os';

test.beforeAll(async () => {
  await resetState();
});

test('@drupal-only linkit integration', async ({ page }) => {
  await drupalLogin(page);
  await page.goto(`${drupal.baseUrl}/en/node/add/gutenberg_page`);

  await page.click('[data-type="core/paragraph"]');
  await page.type('[data-type="core/paragraph"]', 'Text');
  await page.press(
    '[data-type="core/paragraph"]',
    os.platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.getByPlaceholder('Search or type url').fill('ki');
  // Linkit is configured to support media images, while the default Gutenberg
  // autocomplete only supports nodes. Therefor, we check the list to contain
  // the media item.
  // Also, here we ignore the media URL.
  await expect(
    page.locator('.block-editor-link-control__search-item-title', {
      hasText: 'Kitten',
    }),
  ).toBeVisible();
});
