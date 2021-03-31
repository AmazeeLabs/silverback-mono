import { createCypressQuestion, createCypressTask } from '../../dist';

export const visitTestPage = createCypressTask((cy, page) => {
  cy.visit(`./cypress/fixtures/${page}`);
});

export const readListItems = createCypressQuestion((cy, _, assert) => {
  cy.get('li').should((items) =>
    assert(
      items
        .toArray()
        .map((item) => item.textContent)
        .filter((item) => item !== null),
    ),
  );
});

export const appendToList = createCypressTask((cy, { text, list }) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
      resolve(undefined);
    }, 3000);
  });
});
