# Gatsby app connected to Drupal via gatsby-graphql-source-toolkit

☝️ Overview and local setup instructions:
[silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby)
([alt](../silverback-website/docs/drupal/gatsby.mdx))

The app is set up with
[Amazee Gatsby Starter](https://github.com/AmazeeLabs/gatsby-starter).

The connection to Drupal is done via
[`@amazeelabs/gatsby-source-silverback`](../../packages/npm/@amazeelabs/gatsby-source-silverback)
plugin.

## Drupal media support

### Media fields

[gatsby-plugin-remote-images](https://www.gatsbyjs.com/plugins/gatsby-plugin-remote-images/)
downloads Drupal media image files and adds `DrupalMediaImage.localImage` field
to the GraphQL schema. See the plugin configuration in
[gatsby-config.ts](./gatsby-config.ts).

### WYSIWYG fields

- Custom
  [gatsby-plugin-images-from-html](./plugins/gatsby-plugin-images-from-html)
  parses HTML and stores all found images in `childrenImagesFromHtml` field on
  the parent GraphQL type.
- [gatsby-plugin-remote-images](https://www.gatsbyjs.com/plugins/gatsby-plugin-remote-images/)
  downloads images and adds `ImagesFromHtml.localImage` field to the GraphQL
  schema.
- [renderHtml()](./plugins/gatsby-plugin-images-from-html/render-html.tsx)
  replaces `img` tags with Gatsby Images.

See the plugins configuration in [gatsby-config.ts](./gatsby-config.ts).

## Tests

See [test.sh](./test.sh) and [cypress/integration](./cypress/integration).

## Drupal part

See [apps/silverback-drupal](../silverback-drupal).
