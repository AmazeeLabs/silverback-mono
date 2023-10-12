import { gatsby } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test('example', async ({ page }) => {
  expect(typeof page.goto).toBe('function');
  expect(typeof gatsby.baseUrl).toBe('string');
});
