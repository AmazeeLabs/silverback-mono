// Automatic Drupal setup/teardown for tests.
beforeEach(() => {
  cy.exec('./cypress/cypress-setup.sh', {
    timeout: 600000
  });
});

afterEach(() => {
  cy.exec('./cypress/cypress-teardown.sh');
});
