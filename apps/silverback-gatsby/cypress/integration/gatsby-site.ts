import { testImages } from './common';
import { drupalNodeOpUrl, rebuildDelay, siteUrl } from './constants';

describe('Test Gatsby Site', () => {
  it('checks if pre-created content is there', () => {
    cy.visit(siteUrl);
    cy.contains('a', 'With everything');
    cy.contains('a', 'With everything DE');
    cy.contains('a', 'With everything FR');
    cy.contains('a', 'Not published').should('not.exist');
    testImages();
  });

  it('creates unpublished content, then publishes it, then unpublishes it again', () => {
    const title = 'It will blink';

    cy.request('POST', drupalNodeOpUrl, {
      op: 'create',
      node: {
        type: 'article',
        title,
        status: 0,
      },
    })
      .then((response) => {
        return response.body.nid[0].value;
      })
      .then((nid) => {
        cy.wait(rebuildDelay);

        cy.visit(siteUrl);
        cy.contains('a', title).should('not.exist');

        cy.request('POST', drupalNodeOpUrl, {
          op: 'update',
          node: {
            nid,
            status: 1,
          },
        });
        cy.wait(rebuildDelay);
        cy.visit(siteUrl);
        cy.contains('a', title);

        cy.request('POST', drupalNodeOpUrl, {
          op: 'update',
          node: {
            nid,
            status: 0,
          },
        });
        cy.wait(rebuildDelay);
        cy.visit(siteUrl);
        cy.contains('a', title).should('not.exist');
      });
  });
});
