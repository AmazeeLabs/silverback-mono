/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

import { config as dotenvConfig } from 'dotenv';

dotenvConfig({ path: '.env' });

export const siteMetadata = {
  title: 'Silverback Website',
  description: 'Silverback website and documentation',
  author: '@amazeelabs',
};

export const plugins = [
  'gatsby-plugin-sharp',
  'gatsby-remark-images',
  {
    resolve: 'gatsby-plugin-mdx',
    options: {
      gatsbyRemarkPlugins: [
        {
          resolve: 'gatsby-remark-autolink-headers',
          options: {
            icon:
              '<svg viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"></path></svg>',
            className:
              'scale-75 lg:scale-100 -mx-1 xl:-mx-1.5 -translate-x-full absolute transform top-1/2 -translate-y-1/2 opacity-25 hover:opacity-100',
          },
        },
        {
          resolve: 'gatsby-remark-relative-links',
          options: {
            domainRegex: /\/docs\/|\/[\w-]+\.mdx$/g,
          },
        },
        'gatsby-remark-images',
      ],
    },
  },
  'gatsby-plugin-schema-export',
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'docs',
      path: `${__dirname}/docs/`,
    },
  },
  '@amazeelabs/gatsby-theme-core',
  // Required due to #177 https://github.com/AmazeeLabs/silverback-mono/issues/177
  {
    resolve: 'gatsby-plugin-postcss',
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
