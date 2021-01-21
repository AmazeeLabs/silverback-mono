# Gatsby app connected to Drupal GraphQL v3 via gatsby-graphql-source-toolkit

☝️ Overview and local setup instructions:
[silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby)
([alt](../silverback-website/docs/drupal/gatsby.mdx))

The app is set up with
[Amazee Gatsby Starter](https://github.com/AmazeeLabs/gatsby-starter).

## Entry points

- [createQueryExecutor](./src/gatsby-node-helpers/create-query-executor.ts)
  prepares the GraphQL query executor for either Gatsby Site or Gatsby Preview
  mode.
- [drupalNodes](./src/gatsby-node-helpers/drupal-nodes.ts) keeps the meta
  information about the content we want to fetch from Drupal.
  - On Drupal side this list should match with the "Entity types to send to
    Gatsby Preview and Build Server" option in the Gatsby module config.
  - Important: While Tags taxonomy terms aren't used on they own in our Gatsby
    app, we still need to fetch them all in order to allow the toolkit to
    [discover and resolve relationships between the node types in the schema](https://github.com/gatsbyjs/gatsby-graphql-toolkit#2-configure-gatsby-node-types).
- [createSourcingConfig](./src/gatsby-node-helpers/create-sourcing-config.ts)
  tells to the toolkit how to work with Drupal's GraphQL.
- [api-fragments](./src/gatsby-node-helpers/api-fragments) tells to the toolkit
  which content fields to fetch from Drupal's GraphQL.
- [fetchNodeChanges](./src/gatsby-node-helpers/fetch-node-changes.ts) fetches
  the content updates from Drupal and tells to the toolkit what to (re)fetch or
  delete.
- `sourceNodes` from [gatsby-node.ts](./gatsby-node.ts) combines all the above.

## Less important

- [createPaginationAdapter](./src/gatsby-node-helpers/create-pagination-adapter.ts)
  tells to the toolkit how to paginate Drupal's GraphQL queries.

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

See [apps/silverback-drupal-graphql-v3](../silverback-drupal-graphql-v3).
