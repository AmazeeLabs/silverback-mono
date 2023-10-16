import { defineConfig } from '@playwright/test';

import { config } from './playwright.config';

export default defineConfig({
  ...config,
  testDir: './specs-mutating',
  fullyParallel: false,
  workers: 1,
});
