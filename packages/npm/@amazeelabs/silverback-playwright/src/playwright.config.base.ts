import { PlaywrightTestConfig } from '@playwright/test';

import { getEnvVars } from './utils';

const config: PlaywrightTestConfig = {
  testDir: getEnvVars().SP_TEST_DIR,
};
export default config;
