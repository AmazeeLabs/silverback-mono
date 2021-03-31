import {
  readListItems,
  visitTestPage,
  appendToList,
} from '../support/interactions';

describe('Screenplay', () => {
  it('executes tasks and questions', () => {
    cy.perform(visitTestPage, 'test.html');
    cy.ask(readListItems)
      .should('contain', 'A')
      .should('contain', 'B')
      .should('contain', 'C');
    cy.window().then((win) => {
      cy.perform(appendToList, {
        text: 'D',
        list: win.document.getElementsByTagName('ul').item(0),
      });
      cy.ask(readListItems).should('contain', 'D');
    });
  });
});
