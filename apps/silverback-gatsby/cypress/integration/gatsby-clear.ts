import {drupalNodeOpUrl, previewUrl, refreshDelay} from "./constants";

describe('Test gatsby-source-silverback', () => {
  it.only('clears stored nodes when necessary', () => {
    cy.request('POST', drupalNodeOpUrl, {
      op: 'create',
      node: {
        type: 'article',
        title: 'Post-reinstall',
        status: 1,
      },
    });
    cy.wait(refreshDelay);
    cy.visit(previewUrl);
    cy.contains('Post-reinstall');
  });
});
