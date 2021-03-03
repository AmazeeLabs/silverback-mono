import { createCypressQuestion } from 'cypress-screenplay';

export const readCurrentUserName = createCypressQuestion((browser, _, assert) => {
  browser.visit('/user');
  browser.get('h1').should($items => {
    $items.toArray().forEach((item) => {
      assert(item.textContent)
    })
  });
});

export const isToolbarVisible = createCypressQuestion((browser, _, assert) => {
  browser.visit('/');
  browser.get('#toolbar-bar').should($items => {
    assert($items.length === 1);
  });
});

export const readCurrentWorkspace = createCypressQuestion((browser, _, assert) => {
  browser.visit('/');
  browser.get('.toolbar-icon-workspace').should($items => $items.toArray().forEach(item => assert(item.textContent)));
});

export const readCurrentLanguage = createCypressQuestion((browser, _, assert) => {
  browser.visit('/').then(() => {
    browser.get('html').should($items => assert($items.attr('lang')));
  });
});
