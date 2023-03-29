import { drupal, resetState } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';
import { execSync } from 'child_process';

test.beforeAll(async () => {
  await resetState();
});

test('@drupal-only USER option', async ({ page }) => {
  await page.goto(`${drupal.baseUrl}/user`);
  expect(page.url()).not.toMatch(/user\/1$/);

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-USER=admin`,
  );
  await page.goto(`${drupal.baseUrl}/user`);
  expect(page.url()).toMatch(/user\/1$/);

  await page.goto(`${drupal.baseUrl}/test-session/clear`);
  await page.goto(`${drupal.baseUrl}/user`);
  expect(page.url()).not.toMatch(/user\/1$/);
});

test('@drupal-only LANGUAGE option', async ({ page }) => {
  await page.goto(drupal.baseUrl);
  await expect(page.locator('html')).not.toHaveAttribute('lang', 'de');

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-LANGUAGE=de`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');

  await page.goto(`${drupal.baseUrl}/test-session/clear`);
  await page.goto(drupal.baseUrl);
  await expect(page.locator('html')).not.toHaveAttribute('lang', 'de');
});

test('@drupal-only WORKSPACE option', async ({ page }) => {
  execSync('source .envrc && drush en workspaces', {
    cwd: drupal.path,
    shell: '/bin/bash',
  });

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-USER=admin&X-TEST-SESSION-TOOLBAR=on`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('.toolbar-icon-workspace')).not.toHaveText('Stage');

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-WORKSPACE=stage`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('.toolbar-icon-workspace')).toHaveText('Stage');

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-WORKSPACE=`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('.toolbar-icon-workspace')).not.toHaveText('Stage');
});

test('@drupal-only TOOLBAR option', async ({ page }) => {
  // Toolbar should be turned off by default.
  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-USER=admin`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('#toolbar-bar')).toHaveCount(0);

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-TOOLBAR=on`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('#toolbar-bar')).toHaveCount(1);

  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-TOOLBAR=off`,
  );
  await page.goto(drupal.baseUrl);
  await expect(page.locator('#toolbar-bar')).toHaveCount(0);
});
