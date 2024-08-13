import { expect, test } from '@playwright/test';

test('server', async ({ page }) => {
  const response = await page.goto('http://localhost:8080/server');
  expect(response?.status()).toBe(200);
  // await expect(page).toHaveScreenshot({
  //   fullPage: true,
  // });
});

test('client', async ({ page }) => {
  page.on('pageerror', (error) => {
    throw error;
  });
  await page.goto('http://localhost:8080/client');
  // await expect(page).toHaveScreenshot({
  //   fullPage: true,
  // });
});
