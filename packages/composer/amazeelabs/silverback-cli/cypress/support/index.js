// @ts-check
/// <reference types="Cypress" />

// Automatic Drupal setup/teardown for tests.
beforeEach(() => {
  cy.drupalInstall({
    profile: 'minimal',
    config: '../vendor/amazeelabs/silverback-cli/config',
    cache: '../vendor/amazeelabs/silverback-cli/install-cache.zip'
  });
});
