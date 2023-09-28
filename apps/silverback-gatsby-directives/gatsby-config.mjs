/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

export const siteMetadata = {
  title: 'Gatsby Starter',
  description: 'Gatsby starter for Amazee Labs projects',
  author: '@amazeelabs',
};

export const plugins = [
  'gatsby-plugin-pnpm',
  {
    resolve: '@amazeelabs/gatsby-source-silverback',
    options: {
      schema_configuration: './',
      directive_providers: ['@amazeelabs/test-directives#directives'],
    },
  },
];
