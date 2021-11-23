import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  use: {
    screenshot: 'only-on-failure',
    trace: process.env.SP_TRACE ? 'on' : 'off',
  },
  testDir: process.env.SP_TEST_DIR,
  // Since a single test may waitForGatsby multiple times, the default 30s
  // timeout is likely to be exceeded in the gatsby-build mode.
  timeout: 90_000,
};
export default config;
