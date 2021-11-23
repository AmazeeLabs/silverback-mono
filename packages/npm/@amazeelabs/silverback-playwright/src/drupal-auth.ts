import { PlaywrightTestArgs } from '@playwright/test';

import { getConfig } from './config';

export const drupalLogin = async (page: PlaywrightTestArgs['page']) => {
  const { drupal } = getConfig();
  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-USER=${drupal.adminUser.login}&X-TEST-SESSION-TOOLBAR=on`,
  );
};

export const drupalLogout = async (page: PlaywrightTestArgs['page']) => {
  const { drupal } = getConfig();
  await page.goto(`${drupal.baseUrl}/test-session/clear`);
};
