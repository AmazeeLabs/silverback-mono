import { createCypressQuestion } from 'cypress-screenplay';

export const readCurrentUserName = createCypressQuestion((browser, _, assert) => {
  browser.cy.visit('/user');
  browser.cy.get('h1').should($items => {
    $items.toArray().forEach((item) => {
      assert(item.textContent)
    })
  });
});

export const isToolbarVisible = createCypressQuestion((browser, _, assert) => {
  browser.cy.visit('/');
  browser.cy.get('#toolbar-bar').should($items => {
    assert($items.length === 1);
  });
});

export const readCurrentWorkspace = createCypressQuestion((browser, _, assert) => {
  browser.cy.visit('/');
  browser.cy.get('.toolbar-icon-workspace').should($items => $items.toArray().forEach(item => assert(item.textContent)));
});

export const readCurrentLanguage = createCypressQuestion((browser, _, assert) => {
  browser.cy.visit('/').then(() => {
    browser.cy.get('html').should($items => assert($items.attr('lang')));
  });
});
