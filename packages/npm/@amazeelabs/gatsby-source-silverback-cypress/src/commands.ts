declare global {
  namespace Cypress {
    export interface Chainable<Subject = any> {
      waitForGatsby(
        drupalParams: DrupalParams,
        gatsbyParams: GatsbyParams,
        waitOptions: WaitUntilOptions<Subject>,
      ): Chainable<void>;
    }
  }
}

export type DrupalParams = {
  graphqlEndpoint: string;
  user?: string;
  pass?: string;
};

export type GatsbyParams = {
  mode: 'build' | 'preview';
  gatsbyUrl: string;
};

Cypress.Commands.add(
  'waitForGatsby',
  function (
    drupalParams: DrupalParams,
    gatsbyParams: GatsbyParams,
    waitOptions: WaitUntilOptions,
  ) {
    cy.request({
      method: 'POST',
      url: drupalParams.graphqlEndpoint,
      body: {
        operationName: 'GatsbyBuildId',
        variables: {},
        query: `
          query GatsbyBuildId {
            drupalBuildId
          }
        `,
      },
      headers: {
        'Content-Type': 'application/json',
        ...(drupalParams.user && drupalParams.pass
          ? {
              Authorization: `Basic ${btoa(
                `${drupalParams.user}:${drupalParams.pass}`,
              )}`,
            }
          : {}),
      },
    }).then((drupalResponse) => {
      cy.waitUntil(() => {
        if (gatsbyParams.mode === 'build') {
          return cy
            .request(gatsbyParams.gatsbyUrl + '/build.json')
            .then((gatsbyResponse) => {
              return (
                drupalResponse.body.data.drupalBuildId ===
                gatsbyResponse.body.drupalBuildId
              );
            });
        } else {
          return cy
            .request({
              method: 'POST',
              url: gatsbyParams.gatsbyUrl + '/___graphql',
              body: {
                operationName: 'GatsbyBuildId',
                variables: {},
                query: `
                query GatsbyBuildId {
                  drupalBuildId
                }
              `,
              },
              headers: {
                'Content-Type': 'application/json',
              },
            })
            .then(
              (gatsbyResponse) =>
                drupalResponse.body.data.drupalBuildId ===
                gatsbyResponse.body.data.drupalBuildId,
            );
        }
      }, waitOptions);
    });
  },
);
