/* global Given, When, Then */

beforeEach(function () {
  cy.prepareSnapshot('login-preparations', function () {
    cy.drush('en toolbar');
    cy.drush('cr');
  });
  cy.drupalSession({ toolbar: 'on' });
});

const login = (user, pass) => () => {
  cy.visit('/user/login');
  cy.get('#edit-name').type(user);
  cy.get('#edit-pass').type(pass);
  cy.get('form.user-login-form #edit-submit').click();
};

Given(/^I am on the login screen$/, () => {
  cy.visit('/user/login');
});

Given(/^I am on the homepage$/, () => {
  cy.visit('/');
});

Given(/^I am on "(.*)"$/, (path) => {
  cy.visit(path);
});

Given(/^I am logged in as an administrator$/, login("admin", "admin"));

When(/^I use the administration credentials to log in$/, login("admin", "admin"));

When(/^I use invalid administration credentials to log in$/, login("admin", "invalid"));

Then(/^I should see an error message containing "(.*)"$/, (message) => {
  cy.get('div[role="alert"]').contains(message);
});

Then(/^I should see the administration toolbar$/, () => {
  // Cypress doesn't re-send headers unless we re-visit the page.
  cy.visit('/');
  cy.get('#toolbar-bar');
});

Then(/^the page should be displayed with the "seven" theme$/, () => {
  cy.get('#block-seven-page-title');
});
