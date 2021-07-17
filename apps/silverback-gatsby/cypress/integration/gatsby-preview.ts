import { testImages, testUpdates } from './common';
import { drupalNodeOpUrl, previewUrl } from './constants';
import { waitForGatsby } from './wait-for-gatsby';

describe('Test Gatsby Preview', () => {
  it('checks if pre-created content is there', () => {
    cy.visit(previewUrl);
    cy.contains('a', 'With everything');
    cy.contains('a', 'With everything DE');
    cy.contains('a', 'With everything FR');
    cy.contains('a', 'Not published');
    testImages();
  });

  it('tests updates', () => {
    testUpdates('preview');
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
    waitForGatsby('preview');
    cy.contains('a', title);
  });
});
