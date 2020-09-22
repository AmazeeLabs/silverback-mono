// @ts-check
/// <reference types="Cypress" />

const langCodes = {
  'German': 'de'
};

beforeEach(() => {
  cy.drupalInstall({
    setup: 'cypress:integration/CypressTestSiteInstallScript.php',
  });
});

// Given a test case uses 'cy.drupalSession' to authenticate in as "admin"
Given(/^the test case uses 'cy.drupalSession' to authenticate as "([^"]*)"$/, function (account) {
  cy.drupalSession({user: account});
});

// And the test case uses 'cy.drupalSession' to display switch to "German"
And(/^the test case uses 'cy.drupalSession' to display switch to "([^"]*)"$/, function (language) {
  cy.drupalSession({language: langCodes[language]});
});

// And the test case uses 'cy.drupalSession' to switch to workspace "stage"
And(/^the test case uses 'cy.drupalSession' to switch to workspace "([^"]*)"$/, function (workspace) {
  cy.drupalSession({workspace: workspace});
});

// And the test case uses 'cy.drupalSession' to display the toolbar
Given(/^the test case uses 'cy.drupalSession' to display the toolbar$/, function () {
  cy.drupalSession({toolbar: true});
});

// When the test case visits the homepage and clicks the link to the "admin" account
When(/^the test case visits the homepage and clicks the link to the "([^"]*)" account$/, function (account) {
  cy.visit('/');
  cy.contains(account).click();
});

// Then then the "admin" account page should be displayed
Then(/^then the "([^"]*)" account page should be displayed$/, function (account) {
  cy.get('h1').contains(account);
});

// Given the 'toolbar' module is installed
Given(/^the "([^"]*)" module is installed$/, function () {
  // Modules already installed in test site setup.
});

// Then the toolbar should be visible
Then(/^the toolbar should be visible$/, function () {
  cy.get('#toolbar-bar');
});

// Then the "Stage" workspace should active
Then(/^the "([^"]*)" workspace should active$/, function (workspace) {
  cy.get('.workspaces-toolbar-tab').contains(workspace);
});

// And the language "German" is enabled
Given(/^the language "([^"]*)" is enabled$/, function () {
  // Already enabled in test site install.
});

// Then the page is displayed in "German"
Then(/^the page is displayed in "([^"]*)"$/, function (language) {
  cy.get('html[lang="' + langCodes[language] + '"]');
});
