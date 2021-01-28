import {
  drupalNodeOpUrl,
  previewUrl,
  rebuildDelay,
  refreshDelay,
  siteUrl,
} from './constants';

export const testImages = () => {
  // Workaround for "Element is detached from the DOM" on .click() 🤦
  // The .click({ force: true }) workaround also works, but it triggers a page
  // reload and kills the Gatsby navigation.
  // See https://github.com/cypress-io/cypress/issues/7306 for more details.
  cy.wait(100);

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
      const delay = mode === 'preview' ? refreshDelay : rebuildDelay;
      const url =
        (mode === 'preview' ? previewUrl : siteUrl) + '/en/node/' + nid;

      cy.wait(delay);
      cy.visit(url);
      cy.contains(initialBodyText);

      cy.request('POST', drupalNodeOpUrl, {
        op: 'update',
        node: {
          nid,
          field_body: updatedBodyText,
        },
      });

      cy.wait(delay);

      cy.visit(url);
      cy.contains(updatedBodyText);
    });
};
