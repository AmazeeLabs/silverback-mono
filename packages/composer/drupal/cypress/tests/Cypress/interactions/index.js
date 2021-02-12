import { createCypressQuestion } from 'cypress-screenplay';

export const readCurrentUserName = createCypressQuestion((cy, _, assert) => {
  cy.visit('/user');
  cy.get('h1').should($items => {
    $items.toArray().forEach((item) => {
      assert(item.textContent)
    })
  });
});

export const isToolbarVisible = createCypressQuestion((cy, _, assert) => {
  cy.visit('/');
  cy.get('#toolbar-bar').should($items => {
    assert($items.length === 1);
  });
});

export const readCurrentWorkspace = createCypressQuestion((cy, _, assert) => {
  cy.visit('/');
  cy.get('.toolbar-icon-workspace').should($items => $items.toArray().forEach(item => assert(item.textContent)));
});

export const readCurrentLanguage = createCypressQuestion((cy, _, assert) => {
  cy.visit('/').then(() => {
    cy.get('html').should($items => assert($items.attr('lang')));
  });
});
