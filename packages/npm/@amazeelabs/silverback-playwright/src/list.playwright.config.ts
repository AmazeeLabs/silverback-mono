import { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: process.env.SP_TEST_DIR,
};
export default config;
