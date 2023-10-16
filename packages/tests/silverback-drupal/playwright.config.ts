import { defineConfig, devices, PlaywrightTestConfig } from '@playwright/test';

export const config: PlaywrightTestConfig = {
  testDir: './specs',
  webServer: [
    {
      command:
        'pnpm run --filter "@-amazeelabs/silverback-drupal" start > /tmp/drupal.log 2>&1',
      port: 8888,
      reuseExistingServer: !process.env.CI,
    },
  ],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  maxFailures: 1,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: 'on-first-retry',
  },
  reporter: 'list',
  projects: [
    {
      name: 'setup',
      testMatch: /setup\.ts/,
    },
    {
      name: 'chromium',
      testMatch: /\.*.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],
  // Initial gatsby build can take long.
  timeout: 90_000,
};

export default defineConfig(config);
