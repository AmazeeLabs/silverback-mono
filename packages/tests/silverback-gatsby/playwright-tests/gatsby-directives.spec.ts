import { gatsby, resetState } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-both templates', async ({ page }) => {
  await page.goto(`${gatsby.baseUrl}/contacts`);
  await expect(page.locator('td:text-is("Frank Sinatra")')).toBeVisible();
  await expect(page.locator('td:text-is("Elvis Presley")')).toBeVisible();
  await expect(page.locator('td:text-is("John Doe")')).toBeVisible();
  await expect(page.locator('td:text-is("Jane Doe")')).toBeVisible();
});
