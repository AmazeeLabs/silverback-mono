import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  retries: 1,
  testDir: process.env.SP_TEST_DIR,
};
export default config;
