import { createCypressQuestion, createCypressTask } from '../../dist';

export const visitTestPage = createCypressTask((cy, page) => {
  cy.cy.visit(`./cypress/fixtures/${page}`);
});

export const readListItems = createCypressQuestion((cy, _, assert) => {
  cy.cy.get('li').should((items) =>
    assert(
      items
        .toArray()
        .map((item) => item.textContent)
        .filter((item) => item !== null),
    ),
  );
});
