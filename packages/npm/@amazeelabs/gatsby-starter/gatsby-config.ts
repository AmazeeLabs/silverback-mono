/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: `.env` });

// Read in additional environment variables based on the `CURRENT_APP_ENV`
// environment variable.
dotenvConfig({
  path: `.environments/${process.env.CURRENT_APP_ENV || 'local'}.env`,
});

export const siteMetadata = {
  title: 'Gatsby Starter',
  description: 'Gatsby starter for Amazee Labs projects',
  author: '@amazeelabs',
};

export const plugins = [
  'gatsby-plugin-typescript',
  'gatsby-plugin-react-helmet',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: './src/images',
    },
  },
  'gatsby-plugin-postcss',
];
