import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    screenshot: 'only-on-failure',
  },
  testDir: process.env.SP_TEST_DIR,
};
export default config;
