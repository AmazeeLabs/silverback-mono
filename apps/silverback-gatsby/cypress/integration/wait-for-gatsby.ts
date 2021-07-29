import { previewUrl, siteUrl } from './constants';

export const waitForGatsby = (mode: 'preview' | 'site') => {
  if (mode === 'preview') {
    cy.waitForGatsby(
      {
        graphqlEndpoint: 'http://localhost:8888/silverback-gatsby',
        user: 'GatsbyPreview',
        pass: 'GatsbyPreview',
      },
      {
        mode: 'preview',
        gatsbyUrl: previewUrl,
      },
      {
        interval: 500,
        timeout: 15_000,
      },
    );
  } else {
    cy.waitForGatsby(
      {
        graphqlEndpoint: 'http://localhost:8888/silverback-gatsby',
      },
      {
        mode: 'build',
        gatsbyUrl: siteUrl,
      },
      {
        interval: 1_000,
        timeout: 60_000,
      },
    );
  }
};
