# Drupal with GraphQL v3 which is used by Gatsby to source the content

☝️ Overview and local setup instructions: [silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby) ([alt](../silverback-website/docs/drupal/gatsby.mdx))

## Entry points

- [silverback_gatsby](./web/modules/custom/silverback_gatsby) is a tiny custom module which triggers Gatsby Preview refresh and Gatsby Site rebuild.

There is a special GatsbyPreview user having the "Bypass content access control" permission. This one is used by Gatsby Preview to fetch unpublished content.

## Gatsby part

See [apps/silverback-gatsby](../silverback-gatsby).
