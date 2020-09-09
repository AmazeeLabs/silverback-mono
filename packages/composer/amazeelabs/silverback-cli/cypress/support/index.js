// @ts-check
/// <reference types="Cypress" />

// Automatic Drupal setup/teardown for tests.
beforeEach(() => {
  cy.drupalInstall({
    profile: 'minimal',
    cache: '../vendor/amazeelabs/silverback-cli/install-cache.zip'
  });
});
