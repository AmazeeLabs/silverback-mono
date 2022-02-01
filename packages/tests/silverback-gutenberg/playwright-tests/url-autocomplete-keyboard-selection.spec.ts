import {
  drupal,
  drupalLogin,
  resetState,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@drupal-only test url autocomplete keyboard selection.spec.ts', async ({
  page,
}) => {
  await drupalLogin(page);
  await page.goto(`${drupal.baseUrl}/en/node/add/gutenberg_page`);

  await page.click('[data-type="core/paragraph"]');
  await page.click('button[aria-label="Toggle block inserter"]');
  await page.click(':text-is("Teaser")');
  await page.fill('[placeholder="Search or type url"]', 'page');
  await page.waitForSelector('.block-editor-link-control__search-item');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  //await page.waitForSelector('.block-editor-link-control__search-item-title');
  await expect(
    page.locator('.block-editor-link-control__search-item-title'),
  ).toHaveAttribute('href', /^\//);
});
