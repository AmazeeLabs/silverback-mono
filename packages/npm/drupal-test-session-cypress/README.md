# Drupal Test Session Cypress

Extends Cypress API to make it easier to utilize Drupal's
[Test Session](https://www.drupal.org/project/test_session) module.

## Installation

Add the package

```shell
yarn add --dev drupal-test-session-cypress
```

Require it from the Cypress `support/index.js` (or `.ts`)

```js
require('drupal-test-session-cypress');
```

If Drupal's base URL is different from http://localhost:8888, set it via
`DRUPAL_BASE_URL` environment variable.

## Usage

Once installed, the `cy.drupalSession()` is available in your Cypress project.
Examples can be found
[here](https://github.com/AmazeeLabs/silverback-mono/blob/development/packages/composer/drupal/cypress/README.md#cydrupalsession).
