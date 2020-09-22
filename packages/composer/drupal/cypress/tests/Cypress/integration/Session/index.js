// @ts-check
/// <reference types="Cypress" />

import {
  isToolbarVisible, readCurrentLanguage,
  readCurrentUserName,
  readCurrentWorkspace
} from "../../interactions";
import {Actor} from "cypress-screenplay";

const actor = new Actor();

const langCodes = {
  'German': 'de'
};

beforeEach(() => {
  cy.drupalInstall({
    setup: 'cypress:integration/CypressTestSiteInstallScript.php',
  });
});

// Given the 'toolbar' module is installed
Given(/^the "([^"]*)" module is installed$/, function () {
  // Modules already installed in test site setup.
});

// And the language "German" is enabled
Given(/^the language "([^"]*)" is enabled$/, function () {
  // Already enabled in test site install.
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

// Then the "admin" user should be authenticated
Then(/^then the "([^"]*)" user should be authenticated$/, function (account) {
  cy.ask(readCurrentUserName).should(name => expect(account).to.equal(name))
});

// Then the toolbar should be visible
Then(/^the toolbar should be visible$/, function () {
  cy.ask(isToolbarVisible)
});

// Then the "Stage" workspace should active
Then(/^the "([^"]*)" workspace should active$/, function (workspace) {
  cy.ask(readCurrentWorkspace).should(ws => expect(ws).to.equal(workspace));
});

// Then the page is displayed in "German"
Then(/^the website is displayed in "([^"]*)"$/, function (language) {
  cy.ask(readCurrentLanguage).should(ws => expect(ws).to.equal(langCodes[language]));
});
