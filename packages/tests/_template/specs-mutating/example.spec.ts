import {
  drupal,
  drupalLogin,
  gatsby,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('example', async ({ page }) => {
  expect(typeof page.goto).toBe('function');
  expect(typeof gatsby.baseUrl).toBe('string');
  expect(typeof drupal.baseUrl).toBe('string');
  expect(typeof drupalLogin).toBe('function');
  expect(typeof waitForGatsby).toBe('function');
});
