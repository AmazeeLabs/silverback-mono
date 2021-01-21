# A Drupal installation for silverback-mono projects

## Gatsby backend part

☝️ Overview and local setup instructions: [silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby) ([alt](../silverback-website/docs/drupal/gatsby.mdx))

### Entry points

- The content is exposed with [a custom GraphQL schema](./web/modules/custom/silverback_gatsby).
- [Gatsby module](https://www.drupal.org/project/gatsby) triggers Gatsby Preview refresh and Gatsby Site rebuild.
  - Important: "Entity types to send to Gatsby Preview and Build Server" in the module settings should match [drupalNodes](../silverback-gatsby/src/gatsby-node-helpers/drupal-nodes.ts) on Gatsby side.

There is a special GatsbyPreview user having the "Bypass content access control" permission. This one is used by Gatsby Preview to fetch unpublished content.

### Why not version 3 of Drupal GraphQL module

[GraphQL module](https://www.drupal.org/project/graphql) version 3 comes with `graphql_core` submodule which automatically creates GraphQL schema for most of Drupal data. Version 4 however does not include such a feature and forces you to write custom schema/resolvers.

At first glance, v3 looks like an easier solution. We tried it and switched to v4. We found that v4 is better because:

- Custom schema serves as a project documentation. It looks really nice, check our [schema](./web/modules/custom/silverback_gatsby/graphql/silverback_gatsby.graphqls).
- With a custom schema you will never hit a limitation ([example](https://github.com/gatsbyjs/gatsby-graphql-toolkit/issues/25)). Your custom schema can provide any data in any format.
- [Gatsby GraphQL Toolkit](https://github.com/gatsbyjs/gatsby-graphql-toolkit) transforms the source GraphQL data into Gatsby format. Yet the inner stricture is left unchanged. With v3 the frontend experience is not that good as with 4. Compare yourself:
  - v3: `DrupalNodeArticle.fieldImage.entity.fieldMediaImage.alt`
  - v4: `DrupalArticle.image.alt`
- It's much easier to write resolvers for v4. And the resulting code is more readable. For example, [this file](./web/modules/custom/silverback_gatsby/src/Plugin/GraphQL/Schema/SilverbackGatsbySchema.php) contains all resolvers for the schema mentioned above. If you scroll down the helpers, you'll see that each resolver takes just one line of code.

### Gatsby part

See [apps/silverback-gatsby](../silverback-gatsby).
