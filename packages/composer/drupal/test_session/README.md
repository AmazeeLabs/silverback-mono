# Test Session

☝️ Development happens in https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/composer/drupal/test_session

The module provides two endpoints to facilitate end-to-end testing experience.

- `POST` or `GET` `/test-session/set` can be called with the following headers (or url query parameters) to update the current Drupal session context:
  - `X-TEST-SESSION-USER`: the current user's username
  - `X-TEST-SESSION-LANGUAGE`: the current language langcode
  - `X-TEST-SESSION-WORKSPACE`: the current workspace ID
  - `X-TEST-SESSION-TOOLBAR`: `on` to turn on the toolbar, `off` to turn it off (it is turned off by default)
- `POST` or `GET` `/test-session/clear` clears all the above

The module only works if `TEST_SESSION_ENABLED` environment variable is set to `true`.

## Cypress NPM package

The [drupal-test-session-cypress](https://www.npmjs.com/package/drupal-test-session-cypress) NPM package extends Cypress API to make it easier to utilize this module.

## When to use this module

The module functionalities were extracted from the [Cypress](https://www.drupal.org/project/cypress) module.

Use Cypress module if you want

- to start write tests immediately
- not to worry about Cypress configuration / Drupal installation

Use Test Session module if you want

- full control over Cypress configuration
- install Drupal and reset its state between tests yourself
