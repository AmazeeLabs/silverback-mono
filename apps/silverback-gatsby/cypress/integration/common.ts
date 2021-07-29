import { drupalNodeOpUrl, previewUrl, siteUrl } from './constants';
import { waitForGatsby } from './wait-for-gatsby';

// Workaround for "Element is detached from the DOM" 🤦
// It mostly happens after a cy.visit in gatsby-build mode.
// See https://github.com/cypress-io/cypress/issues/7306 for more details.
const fixCypress = () => cy.wait(100);

export const testImages = () => {
  fixCypress();
  cy.contains('a', 'With everything').click();
  // There should be kitten and pug images in the article.
  cy.get('img[alt="Kitten alt text"]').should('exist');
  cy.get('img[alt="Pug alt text"]').should('exist');
};

export const testUpdates = (mode: 'preview' | 'site') => {
  const title = 'Test update';
  const initialBodyText = 'Initial body text';
  const updatedBodyText = 'Updated body text';
  cy.request('POST', drupalNodeOpUrl, {
    op: 'create',
    node: {
      type: 'article',
      title,
      field_body: initialBodyText,
      status: 1,
    },
  })
    .then((response) => {
      return response.body.nid[0].value;
    })
    .then((nid) => {
      const url =
        (mode === 'preview' ? previewUrl : siteUrl) + '/en/node/' + nid;

      waitForGatsby(mode);
      cy.visit(url);
      cy.contains(initialBodyText);

      cy.request('POST', drupalNodeOpUrl, {
        op: 'update',
        node: {
          nid,
          field_body: updatedBodyText,
        },
      });

      waitForGatsby(mode);
      cy.visit(url);
      cy.contains(updatedBodyText);
    });
};

export const testTemplates = (mode: 'preview' | 'site') => {
  cy.visit(mode === 'preview' ? previewUrl : siteUrl);
  fixCypress();

  cy.contains('a', 'With everything').click();
  cy.contains('This article is promoted').should('not.exist');

  cy.contains('a', 'To frontpage').click();
  cy.contains('a', 'Article promoted').click();
  cy.contains('This article is promoted');

  cy.contains('a', 'To frontpage').click();
  cy.contains('a', 'A page').click();
  cy.contains('This is a stub page');
};
