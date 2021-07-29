import { testImages, testTemplates, testUpdates } from './common';
import { drupalNodeOpUrl, siteUrl } from './constants';
import { waitForGatsby } from './wait-for-gatsby';

describe('Test Gatsby Site', () => {
  it('checks if pre-created content is there', () => {
    cy.visit(siteUrl);
    cy.contains('a', 'With everything');
    cy.contains('a', 'With everything DE');
    cy.contains('a', 'With everything FR');
    cy.contains('a', 'Not published').should('not.exist');
    cy.contains('a', 'Article promoted');
    testImages();
  });

  it('tests updates', () => {
    testUpdates('site');
  });

  it('tests templates', () => {
    testTemplates('site');
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
        waitForGatsby('site');

        cy.visit(siteUrl);
        cy.contains('a', title).should('not.exist');

        cy.request('POST', drupalNodeOpUrl, {
          op: 'update',
          node: {
            nid,
            status: 1,
          },
        });
        waitForGatsby('site');
        cy.visit(siteUrl);
        cy.contains('a', title);

        cy.request('POST', drupalNodeOpUrl, {
          op: 'update',
          node: {
            nid,
            status: 0,
          },
        });
        waitForGatsby('site');
        cy.visit(siteUrl);
        cy.contains('a', title).should('not.exist');
      });
  });
});
