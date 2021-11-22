import { PlaywrightTestConfig } from '@playwright/test';

import base from './playwright.config.base';
import { getEnvVars } from './utils';

const config: PlaywrightTestConfig = {
  ...base,
  use: {
    screenshot: 'only-on-failure',
    trace: getEnvVars().SP_TRACE ? 'on' : 'off',
  },
  // Since a single test may waitForGatsby multiple times, the default 30s
  // timeout is likely to be exceeded in the gatsby-build mode.
  timeout: 60_000,
};
export default config;
