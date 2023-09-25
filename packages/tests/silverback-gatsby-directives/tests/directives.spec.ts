import { test, expect } from '@playwright/test';

test('page created from directives schema', async ({ page }) => {
  await page.goto(`http://localhost:9001/contacts`);
  await expect(
    page.locator('p:text-is("Schema value: value from schema")'),
  ).toBeVisible();
  await expect(
    page.locator('p:text-is("Parent value: parent value")'),
  ).toBeVisible();
  await expect(
    page.locator('p:text-is("Argument value: argument value")'),
  ).toBeVisible();
  await expect(page.locator('td:text-is("Frank Sinatra")')).toBeVisible();
  await expect(page.locator('td:text-is("Elvis Presley")')).toBeVisible();
  await expect(page.locator('td:text-is("John Doe")')).toBeVisible();
  await expect(page.locator('td:text-is("Jane Doe")')).toBeVisible();
});
