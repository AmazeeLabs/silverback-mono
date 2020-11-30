import { drupalUrl, refreshDelay } from './constants';

describe('Test Gatsby Preview Refresh status', () => {
  it('tests it', () => {
    cy.visit(`${drupalUrl}/user/login`);
    cy.get('#edit-name').type('admin');
    cy.get('#edit-pass').type('admin');
    cy.get('#edit-submit').click();
    cy.contains('a', 'Gatsby Preview status: Idle');

    cy.visit(`${drupalUrl}/node/add/page`);
    cy.get('#edit-title-0-value').type('New page');
    cy.get('#edit-field-body-0-value').type('Body');
    cy.get('#edit-submit').click();
    cy.contains('a', 'Gatsby Preview status: Rebuilding');
    cy.wait(refreshDelay);
    cy.contains('a', 'Gatsby Preview status: Idle');
  });
});
