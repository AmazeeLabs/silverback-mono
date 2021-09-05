# Silverback Playwright

Playwright tests runner for Silverback setups.

At the moment it can be used only with Silverback monorepo packages.

# Usage

Add `@amazeelabs/silverback-playwright` to your package dev dependencies.

(Consider making tests a separate package. In this case you can depend it on
several other packages without ruining their dependencies.)

In your package, create `playwright-tests` directory with test files.

Run `yarn sp-test`.

## Example test

`playwright-tests/my-tests.spec.ts`

```ts
import {
  drupal,
  drupalLogin,
  drupalLogout,
  gatsby,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-both test gatsby', async ({ page }) => {
  await drupalLogin(page);
  await page.goto(`${drupal.baseUrl}/en/node/add/page`);
  // Do stuff in Drupal, e.g. create a new page.
  await drupalLogout(page);

  await waitForGatsby();

  await page.goto(`${gatsby.baseUrl}/en/my-page`);
  // Check changes on Gatsby side.
});

test('@drupal-only test drupal', async ({ page }) => {
  // Here we only have Drupal.
});
```

For more examples see
[packages/tests/silverback-iframe](../../../tests/silverback-iframe).

## Test types

The runner will run tests in different modes. Each mode has own context.

- `drupal-only` has Drupal started
- `gatsby-develop` has Drupal and `gatsby develop` started
- `@gatsby-build` has Drupal and
  [Gatsby Fast Builds](../../../../apps/silverback-gatsby/fast-builds/README.md)
  started

## Test tags

You can add these tags to the test names to run them in desired test modes:
`@drupal-only`, `@gatsby-develop`, `@gatsby-build`, `@gatsby-both`.

Tests marked with `@gatsby-both` will be executed in both `gatsby-develop` and
`@gatsby-build` modes.

## Exports to use in tests

- `resetState` restored the Drupal/Gatsby state. It can be added to `beforeAll`
  or `beforeEach` hooks. It MUST be called at least once.
- `waitForGatsby` will resolve once Gatsby is updated with recent Drupal
  changes.
- `drupalLogin` and `drupalLogout` use
  [test_session](../../../composer/drupal/test_session) to set the auth state.
- `drupal` and `gatsby` provide various constants (ports, URLs, credentials,
  etc.)

## Debug tests

To debug a particular test:

- Mark it with `.only` and use `page.pause()`
  ```ts
  test.only('my test', async ({ page }) => {
    // ...
    await page.pause();
    // ...
  });
  ```
- Run the tests with `--headed` (`-h`) flag.

If you suspect that something is wrong with the test runner, start it with
`--verbose` (`-v`) flag.

# Tips

To speedup tests, Drupal state is restored from the `test` snapshot. If you did
some Drupal changes, remove `apps/silverback-drupal/.silverback-snapshots/test`.
