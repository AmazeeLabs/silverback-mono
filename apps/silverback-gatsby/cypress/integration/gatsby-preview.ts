import { drupalNodeOpUrl, previewUrl } from './constants';

describe('Test Gatsby Preview', () => {
  it('checks if pre-created content is there', () => {
    cy.visit(previewUrl);
    cy.contains('a', 'With tags');
    cy.contains('a', 'With summary');
    cy.contains('a', 'Not published');
  });

  it('creates unpublished content', () => {
    const title = 'Another unpublished article';
    const refreshDelay = 10_000;

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
