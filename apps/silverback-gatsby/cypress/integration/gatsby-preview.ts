import { testImages } from './common';
import { drupalNodeOpUrl, previewUrl, refreshDelay } from './constants';

describe('Test Gatsby Preview', () => {
  it('checks if pre-created content is there', () => {
    cy.visit(previewUrl);
    cy.contains('a', 'With everything');
    cy.contains('a', 'With everything DE');
    cy.contains('a', 'With everything FR');
    cy.contains('a', 'Not published');
    testImages();
  });

  it('creates unpublished content', () => {
    const title = 'Another unpublished article';

    cy.visit(previewUrl);
    cy.contains('a', title).should('not.exist');

    cy.request('POST', drupalNodeOpUrl, {
      op: 'create',
      node: {
        type: 'article',
        title,
        status: 0,
      },
    });
    cy.wait(refreshDelay);
    cy.contains('a', title);
  });
});
