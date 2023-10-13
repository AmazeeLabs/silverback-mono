import { devices, expect, PlaywrightTestArgs } from '@playwright/test';
import { PlaywrightTestConfig } from '@playwright/test/types/test';
import { execSync } from 'child_process';

export const gatsby = {
  baseUrl: 'http://127.0.0.1:8000',
};

export const drupal = {
  baseUrl: 'http://127.0.0.1:8888',
  path: '../../../apps/silverback-drupal',
};

export const drush = (cmd: string): string => {
  return execSync(
    `pnpm --filter "@-amazeelabs/silverback-drupal" exec -- pnpm --silent drush ${cmd}`,
  ).toString();
};

export const waitForGatsby = async () => {
  const gatsbyStatus = async (): Promise<'building' | 'ready' | 'outdated'> => {
    let gatsbyBuildId;
    try {
      const response = await (
        await fetch(gatsby.baseUrl + '/build.json')
      ).json();
      gatsbyBuildId = (response as any).drupalBuildId.toString();
    } catch (e) {
      gatsbyBuildId = null;
    }

    if (gatsbyBuildId === null) {
      return 'building';
    }

    const drupalBuildId = drush(
      `eval 'echo \\Drupal::service("silverback_gatsby.update_tracker")->latestBuild("silverback_gatsby")'`,
    );

    return drupalBuildId === gatsbyBuildId ? 'ready' : 'outdated';
  };

  const status = await gatsbyStatus();

  if (status === 'ready') {
    return;
  }

  const timeout = setTimeout(() => {
    throw new Error('Gatsby took too long to build.');
  }, 90_000);

  if (status === 'outdated') {
    // Sometimes this request fails in CI.
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      attempt++;
      try {
        await fetch(gatsby.baseUrl + '/___status/build', {
          method: 'post',
        });
        break;
      } catch (e) {
        console.warn(`Could not trigger a build on attempt ${attempt}`);
        if (attempt < maxAttempts) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }
    }
  }

  while ((await gatsbyStatus()) !== 'ready') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  clearTimeout(timeout);
};

export const resetState = async () => {
  execSync(
    'pnpm run --filter "@-amazeelabs/silverback-drupal" snapshot-restore',
  );
  await waitForGatsby();
};

export const drupalLogin = async (
  page: PlaywrightTestArgs['page'],
  user?: string,
) => {
  await page.goto(drupal.baseUrl + '/user/login');
  await page.getByRole('textbox', { name: 'Username' }).fill(user || 'admin');
  await page.getByRole('textbox', { name: 'Password' }).fill(user || 'admin');
  await page.getByRole('button', { name: 'Log in' }).click();
  await expect(
    page.getByRole('heading', { name: 'admin', exact: true }),
  ).toHaveCount(1);
};

export const drupalLogout = async (page: PlaywrightTestArgs['page']) => {
  await page.goto(drupal.baseUrl + '/user/logout');
};

export const playwrightConfigDefaults: PlaywrightTestConfig = {
  testDir: './specs',
  webServer: [
    {
      command:
        'pnpm run --filter "@-amazeelabs/silverback-drupal" start > /tmp/drupal.log 2>&1',
      port: 8888,
      reuseExistingServer: !process.env.CI,
    },
    {
      command:
        'pnpm run --filter "@-amazeelabs/silverback-gatsby" start > /tmp/gatsby.log 2>&1',
      port: 8000,
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

export const playwrightConfigMutatingDefaults: PlaywrightTestConfig = {
  ...playwrightConfigDefaults,
  testDir: './specs-mutating',
  fullyParallel: false,
  workers: 1,
};
