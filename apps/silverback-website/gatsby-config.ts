/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: `.env` });

export const siteMetadata = {
  title: 'Silverback Website',
  description: 'Silverback website and documentation',
  author: '@amazeelabs',
};

export const plugins = [
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: './src/images',
    },
  },
  '@amazeelabs/gatsby-theme-core',
];
