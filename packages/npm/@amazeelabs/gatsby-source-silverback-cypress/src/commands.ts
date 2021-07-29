declare global {
  namespace Cypress {
    export interface Chainable<Subject = any> {
      waitForGatsby(
        drupalParams: DrupalParams,
        gatsbyParams: GatsbyParams,
        waitOptions: WaitOptions,
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

export type WaitOptions = {
  timeout: number;
  interval: number;
};

Cypress.Commands.add(
  'waitForGatsby',
  function (
    drupalParams: DrupalParams,
    gatsbyParams: GatsbyParams,
    waitOptions: WaitOptions,
  ) {
    const start = Date.now();

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
      const drupalBuildId = drupalResponse.body.data.drupalBuildId;

      const checkBuildId = (gatsbyBuildId: number) => {
        if (gatsbyBuildId === drupalBuildId) {
          // Give Gatsby additional time.
          cy.wait(1000);
          return;
        }
        if (Date.now() > start + waitOptions.timeout) {
          cy.log(
            `⚠️ Warning: Waited ${waitOptions.timeout}ms, but drupalBuildId did not get updated.`,
          );
          return;
        }
        cy.wait(waitOptions.interval, { log: false }).then(() => {
          callGatsby();
        });
      };

      const callGatsby = () => {
        cy.request(
          gatsbyParams.mode === 'build'
            ? {
                method: 'GET',
                url: gatsbyParams.gatsbyUrl + '/build.json',
              }
            : {
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
              },
        ).then((gatsbyResponse) => {
          checkBuildId(
            gatsbyParams.mode === 'build'
              ? gatsbyResponse.body.drupalBuildId
              : gatsbyResponse.body.data.drupalBuildId,
          );
        });
      };

      callGatsby();
    });
  },
);
