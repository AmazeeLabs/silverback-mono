/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: `.env` });

export const siteMetadata = {
  title: 'Gatsby Starter',
  description: 'Gatsby starter for Amazee Labs projects',
  author: '@amazeelabs',
};

export const plugins = [
  'gatsby-plugin-react-helmet',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: './src/images',
    },
  },
  '@amazeelabs/gatsby-theme-core',
  'gatsby-plugin-schema-export',
  {
    resolve: `gatsby-plugin-schema-snapshot`,
    options: {
      path: `generated/schema.snapshot`,
      exclude: {
        plugins: [`gatsby-source-npm-package-search`],
      },
      update: process.env.GATSBY_UPDATE_SCHEMA_SNAPSHOT,
    },
  },
];
