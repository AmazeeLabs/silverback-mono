import { expect, test } from '@playwright/test';

test('server', async ({ page }) => {
  await page.goto('http://localhost:8080/server');
  await expect(page).toHaveScreenshot({
    fullPage: true,
  });
});

test('client', async ({ page }) => {
  await page.goto('http://localhost:8080/client');
  await expect(page).toHaveScreenshot({
    fullPage: true,
  });
});
