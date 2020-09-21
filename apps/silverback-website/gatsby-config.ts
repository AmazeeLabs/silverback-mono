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
  'gatsby-plugin-mdx',
  {
    resolve: `gatsby-source-filesystem`,
    options: {
      name: `docs`,
      path: `${__dirname}/docs/`,
    },
  },
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: `${__dirname}/src/images/`,
    },
  },
  '@amazeelabs/gatsby-theme-core',
  // Required due to #177 https://github.com/AmazeeLabs/silverback-mono/issues/177
  {
    resolve: `gatsby-plugin-postcss`,
    options: {
      postCssPlugins: [
        // Transform @import rules by inlining content.
        require('postcss-import'),
        // Automatic prefixing and browser compatibility.
        require('postcss-preset-env')({ stage: 0 }),
        // Apply tailwind features.
        require('tailwindcss')(),
        // Strip CSS comments.
        require('postcss-discard-comments'),
        // Add vendor prefixes.
        require('autoprefixer'),
      ],
    },
  },
];
