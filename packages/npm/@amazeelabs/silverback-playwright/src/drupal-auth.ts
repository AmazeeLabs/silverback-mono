import { PlaywrightTestArgs } from '@playwright/test';

import { drupal } from './constants';

export const drupalLogin = async (page: PlaywrightTestArgs['page']) => {
  await page.goto(
    `${drupal.baseUrl}/test-session/set?X-TEST-SESSION-USER=${drupal.adminUser.login}`,
  );
};

export const drupalLogout = async (page: PlaywrightTestArgs['page']) => {
  await page.goto(`${drupal.baseUrl}/test-session/clear`);
};
