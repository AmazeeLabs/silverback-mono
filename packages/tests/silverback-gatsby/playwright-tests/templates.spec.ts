import { gatsby, resetState } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-both templates', async ({ page }) => {
  await page.goto(gatsby.baseUrl);

  await page.click('a:text-is("With everything")');
  await expect(page.locator('body')).not.toContainText(
    'This article is promoted',
  );

  await page.click('a:text-is("To frontpage")');
  await page.click('a:text-is("Article promoted")');
  await expect(page.locator('body')).toContainText('This article is promoted');

  await page.click('a:text-is("To frontpage")');
  await page.click('a:text-is("A page")');
  await expect(page.locator('body')).toContainText('This is a stub page');
});
