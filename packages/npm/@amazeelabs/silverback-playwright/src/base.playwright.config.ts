import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  retries: 1,
  testDir: process.env.SP_TEST_DIR,
  // Since a single test may waitForGatsby multiple times, the default 30s
  // timeout is likely to be exceeded in the gatsby-build mode.
  timeout: 60_000,
};
export default config;
