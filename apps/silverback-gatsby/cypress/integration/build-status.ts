import { drupalUrl, rebuildDelay } from './constants';

describe('Test Gatsby Build Monitor integration', () => {
  it('tests it', () => {
    cy.visit(`${drupalUrl}/user/login`);
    cy.get('#edit-name').type('admin');
    cy.get('#edit-pass').type('admin');
    cy.get('#edit-submit').click();
    cy.contains('a', 'Website is ready');

    cy.visit(`${drupalUrl}/node/add/page`);
    cy.get('#edit-title-0-value').type('New page');
    cy.get('.cke_button__source').click();
    cy.get('textarea.cke_source').type('Body');
    cy.get('#edit-submit').click();

    // Give it few seconds to receive the status.
    cy.wait(3_000);
    cy.contains('a', 'Website is building');

    cy.wait(rebuildDelay);
    cy.contains('a', 'Website is ready');

    cy.visit(`${drupalUrl}/admin/reports/gatsby-build-logs`);
    cy.get('.view-gatsby-build-monitor-logs table td').should(
      'have.length.gt',
      1,
    );
  });
});
