import { PlaywrightTestConfig } from '@playwright/test';

import base from '../base.playwright.config';

const config: PlaywrightTestConfig = {
  ...base,
  globalSetup: 'global-setup.ts',
};
export default config;
