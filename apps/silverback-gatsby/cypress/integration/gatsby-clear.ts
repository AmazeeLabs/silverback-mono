import { drupalNodeOpUrl, previewUrl } from './constants';
import { waitForGatsby } from './wait-for-gatsby';

describe('Test gatsby-source-silverback', () => {
  it('clears stored nodes when necessary', () => {
    cy.request('POST', drupalNodeOpUrl, {
      op: 'create',
      node: {
        type: 'article',
        title: 'Post-reinstall',
        status: 1,
      },
    });
    waitForGatsby('preview');
    cy.visit(previewUrl);
    cy.contains('Post-reinstall');
  });
});
