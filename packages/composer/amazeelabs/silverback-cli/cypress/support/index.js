// @ts-check
/// <reference types="Cypress" />

// Automatic Drupal setup/teardown for tests.
beforeEach(() => {
  cy.drupalInstall({
    profile: 'minimal',
    config: '../vendor/amazeelabs/silverback/config',
    cache: '../vendor/amazeelabs/silverback/install-cache.zip'
  });
});
