# Drupal with GraphQL v3 which is used by Gatsby to source the content

☝️ Overview and local setup instructions: [silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby) ([alt](../silverback-website/docs/drupal/gatsby.mdx))

## Entry points

- The content is exposed with [GraphQL v3 module](https://www.drupal.org/project/graphql).
- [Gatsby module](https://www.drupal.org/project/gatsby) triggers Gatsby Preview refresh and Gatsby Site rebuild.
  - Important: "Entity types to send to Gatsby Preview and Build Server" in the module settings should match [drupalNodes](../silverback-gatsby/src/gatsby-node-helpers/drupal-nodes.ts) on Gatsby side.

There is a special GatsbyPreview user having the "Bypass content access control" permission. This one is used by Gatsby Preview to fetch unpublished content.

## Gatsby part

See [apps/silverback-gatsby](../silverback-gatsby).
