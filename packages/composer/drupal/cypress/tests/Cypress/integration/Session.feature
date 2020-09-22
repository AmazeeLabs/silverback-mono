Feature: Session management
  The Drupal module for Cypress allows test cases to control the user session
  without navigating the user interface in every test run. By using the built in
  'cy.drupalSession' command, it is possible to control the authenticated
  account, language, workspace and toolbar display. The session parameters set
  this way also persist during further navigation.

  Scenario: Authentication
    When the test case uses 'cy.drupalSession' to authenticate as "admin"
    Then then the "admin" user should be authenticated

  Scenario: Toolbar
    Given the "toolbar" module is installed
    When the test case uses 'cy.drupalSession' to authenticate as "admin"
    And the test case uses 'cy.drupalSession' to display the toolbar
    Then the toolbar should be visible

  Scenario: Workspace
    Given the "workspace" module is installed
    When the test case uses 'cy.drupalSession' to authenticate as "admin"
    And the test case uses 'cy.drupalSession' to switch to workspace "stage"
    And the test case uses 'cy.drupalSession' to display the toolbar
    Then the "Stage" workspace should active

  Scenario: Language
    Given the "language" module is installed
    And the language "German" is enabled
    When the test case uses 'cy.drupalSession' to display switch to "German"
    And the test case uses 'cy.drupalSession' to authenticate as "admin"
    Then the website is displayed in "German"
