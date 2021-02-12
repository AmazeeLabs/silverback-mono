// @ts-check
/// <reference types="Cypress" />

import '@testing-library/cypress/add-commands';
import 'cypress-screenplay';
import './commands.js';

afterEach(() => {
  cy.drupalUninstall();
});
