import { gatsby } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test('templates', async ({ page }) => {
  await page.goto(`${gatsby.baseUrl}/contacts`);
  await expect(
    page.locator('p:text-is("Schema value: hardcoded")'),
  ).toBeVisible();
  await expect(page.locator('p:text-is("Parent value: parent")')).toBeVisible();
  await expect(
    page.locator('p:text-is("Argument value: argument")'),
  ).toBeVisible();
  await expect(
    page.locator('p:text-is("Autoload static: gatsby value")'),
  ).toBeVisible();
  await expect(
    page.locator('p:text-is("Autoload service: gatsby value")'),
  ).toBeVisible();
  await expect(page.locator('td:text-is("Frank Sinatra")')).toBeVisible();
  await expect(page.locator('td:text-is("Elvis Presley")')).toBeVisible();
  await expect(page.locator('td:text-is("John Doe")')).toBeVisible();
  await expect(page.locator('td:text-is("Jane Doe")')).toBeVisible();
});

test('@gatsby-both drupal custom schema', async ({ page }) => {
  await page.goto(`${gatsby.baseUrl}/custom-schema`);
  await expect(
    page.locator(
      'p:text-is("A page (Page:a38bce61-3640-4799-bacf-18ccc6e74216:en)")',
    ),
  ).toBeVisible();
  await expect(page.locator('p:text-is("Load: A page")')).toBeVisible();
});
