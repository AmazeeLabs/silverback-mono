# Silverback Playwright

Playwright tests runner for Silverback setups.

At the moment it can be used only with Silverback monorepo packages.

# Usage

In your package:

- Add this package with `yarn add @amazeelabs/silverback-playwright --dev`
- Add `test-results` to `.gitignore`
- Create `playwright-tests` directory
- Create some test files following `*.spec.ts` name pattern
- Run `yarn sp-test`

(Consider making tests a separate package. In this case you can depend it on
several other packages without ruining their dependencies.)

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
- `gatsby-build` has Drupal and
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

## Debugging tests

There are few options.

### To debug a particular test

Mark it with `.only` and use `page.pause()`

```ts
test.only('my test', async ({ page }) => {
  // ...
  await page.pause();
  // ...
});
```

Run the tests with `--headed` (`-h`) flag.

### To see all logs

Start tests with `--verbose` (`-v`) flag.

This will print

- executed commands
- Gatsby and Drupal logs
- debug messages from the test runner

### Traces

Sometimes it can happen that a test works in the headed mode, but fails in the
headless one. [Traces](https://playwright.dev/docs/trace-viewer/) help a lot
here.

To record traces, run the tests with `--trace` (`-t`) flag.

To see the traces, go to your package dir and run

```
yarn playwright show-trace ./test-results/path/to/trace.zip
```

## Re-running tests

Unlike Cypress, Playwright UI does not have an option to restart a test. But
there is a workaround:

- put `page.pause()` to the end of your test
- start tests with `yarn sp-test -h -r`
- in case if you need to re-run the test, force-kill the browser

One downside of this method is that you won't see error messages if there is a
runtime error or if an assertion fails.

## Tips

To speedup tests, Drupal state is restored from the `test` snapshot. If you did
some Drupal changes, remove `apps/silverback-drupal/.silverback-snapshots/test`.
