import { createQuestion } from 'cypress-screenplay';

export const readCurrentUserName = createQuestion((cy, _, assert) => {
  cy.visit('/user');
  cy.get('h1').should($items => {
    $items.toArray().forEach((item) => {
      assert(item.textContent)
    })
  });
});

export const isToolbarVisible = createQuestion((cy, _, assert) => {
  cy.visit('/');
  cy.get('#toolbar-bar').should($items => {
    assert($items.length === 1);
  });
});

export const readCurrentWorkspace = createQuestion((cy, _, assert) => {
  cy.visit('/');
  cy.get('.toolbar-icon-workspace').should($items => $items.toArray().forEach(item => assert(item.textContent)));
});

export const readCurrentLanguage = createQuestion((cy, _, assert) => {
  cy.visit('/').then(() => {
    cy.get('html').should($items => assert($items.attr('lang')));
  });
});
