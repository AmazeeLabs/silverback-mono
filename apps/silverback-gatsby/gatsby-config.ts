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
  {
    resolve: 'gatsby-source-filesystem',
    options: {
      name: 'images',
      path: './src/images',
    },
  },
  '@amazeelabs/gatsby-theme-core',
  ...(process.env.SCHEMA_UPDATE === 'true'
    ? ['gatsby-plugin-schema-export']
    : []),
  // Transform Drupal media image fields into local images.
  {
    resolve: `gatsby-plugin-remote-images`,
    options: {
      nodeType: 'DrupalImage',
      imagePath: 'url',
    },
  },

  // Transform images from Drupal WYSIWYG fields into local images.
  {
    resolve: 'gatsby-plugin-images-from-html',
    options: {
      configs: [
        {
          nodeType: 'DrupalPageTranslations',
          propertyPath: 'translations.body',
          baseUrl: process.env.DRUPAL_BASE_URL,
        },
        {
          nodeType: 'DrupalArticleTranslations',
          propertyPath: 'translations.body',
          baseUrl: process.env.DRUPAL_BASE_URL,
        },
      ],
    },
  },
  {
    resolve: `gatsby-plugin-remote-images`,
    options: {
      nodeType: 'ImagesFromHtml',
      imagePath: 'urlAbsolute',
    },
  },

  'gatsby-transformer-sharp',
  'gatsby-plugin-sharp',
];
