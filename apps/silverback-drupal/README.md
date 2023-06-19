# A Drupal installation for silverback-mono projects

## Gatsby backend part

☝️ Overview and local setup instructions:
[silverback.netlify.app/drupal/gatsby](https://silverback.netlify.app/drupal/gatsby)
([alt](../silverback-website/docs/drupal/gatsby.mdx))

### Entry points

- The content is exposed with
  [a custom GraphQL schema](./web/modules/custom/silverback_gatsby_test).
- [Gatsby module](https://www.drupal.org/project/gatsby) triggers Gatsby Preview
  refresh and Gatsby Site rebuild.
  - Important: "Entity types to send to Gatsby Preview and Build Server" in the
    module settings should match
    [drupalNodes](../silverback-gatsby/src/gatsby-node-helpers/drupal-nodes.ts)
    on Gatsby side.

There is a special GatsbyPreview user having the "Bypass content access control"
permission. This one is used by Gatsby Preview to fetch unpublished content.

### Why not version 3 of Drupal GraphQL module

[GraphQL module](https://www.drupal.org/project/graphql) version 3 comes with
`graphql_core` submodule which automatically creates GraphQL schema for most of
Drupal data. Version 4 however does not include such a feature and forces you to
write custom schema/resolvers.

At first glance, v3 looks like an easier solution. We tried it but then switched
to v4. We found that v4 is better because:

- Custom schema serves as a project documentation. Here is
  [this app's schema](./web/modules/custom/silverback_gatsby_test/graphql/silverback_gatsby_test.graphqls)
  for instance.
- With a custom schema you will never hit a limitation. Custom schema can
  provide any data in any format.
- [Gatsby GraphQL Toolkit](https://github.com/gatsbyjs/gatsby-graphql-toolkit)
  transforms the source GraphQL data into Gatsby format. Yet the inner stricture
  is left unchanged. With v3 the frontend experience is not that good as with 4.
  Compare yourself:
  - v3: `DrupalNodeArticle.fieldImage.entity.fieldMediaImage.alt`
  - v4: `DrupalArticle.image.alt`
- It's really easy to write resolvers for v4. For example,
  [this file](./web/modules/custom/silverback_gatsby_test/src/Plugin/GraphQL/Schema/SilverbackGatsbyTestSchema.php)
  contains all resolvers for the schema mentioned above. If you scroll down the
  helpers, you'll see that each resolver takes just one line of code.

### Gatsby part

See [apps/silverback-gatsby](../silverback-gatsby).

### Authentication server

Based on OAuth2.

The scopes are

- [Publisher access](../../packages/npm/@amazeelabs/publisher/README.md#oauth2)
  with Drupal credentials
- Gatsby Preview (instant preview) - WIP
- Gatsby Build (sourcing) - WIP
- Frontend users, other APIs, ... (project specific)

#### Install on existing projects

If you are not using the
[Silverback template](https://github.com/AmazeeLabs/silverback-template) or if
Simple OAuth is not installed yet, follow these steps.

- `composer require drupal/simple_oauth`
- `drush en simple_oauth && drush cex`

Add these patches in composer.json

```json
"drupal/simple_oauth": {
  "LogicException: leaked metadata was detected": "https://www.drupal.org/files/issues/2023-01-17/logic_exception_leaked_metadata_was_detected-3334329-02.patch",
  "Revoke token": "https://www.drupal.org/files/issues/2021-10-30/simple_oauth-permit_logout_and_revoke_tokens-2945273-34.patch"
}
```

##### Generic configuration

- Create a Role for each scope and assign the relevant permissions
- Create a Consumer for each scope (see below)
  - Publisher does not need to have a specific user set
  - Gatsby Preview and Gatsby Build should use a pre-defined user
  - The `default` Consumer can be deleted
- Generate keys `/admin/config/people/simple_oauth`
  - Create a directory outside the docroot `mkdir keys`
  - Click on "Generate keys" and set `../keys/` as the directory name
  - Click save
  - It could be gitignored but then have to be generated on the environment and
    persisted between deployments
- Drupal hash salt needs to be at least 32 characters long - make sure to
  override `DRUPAL_HASH_SALT` env variable. An uuid is 36 chars long and can be
  used for that.

##### Publisher specific configuration

Create the Publisher Role and the Publisher Consumer.

_Consumer_

You can remove the default Consumer entity in /admin/config/services/consumer

- Label: `Publisher`
- Client ID: `publisher`
- Client secret: the one configured in Publisher
- User: none
- Is confidential: `true`
- Is this consumer third party: `true`
- If using `Authorization Code` grant type, for the Publisher consumer, set the
  redirect uri to `[publisher_base_url]/oauth/callback`
- Scopes: `Publisher`

_Roles/permissions_

Add the `Grant OAuth2 codes` and `Access Publisher` permissions to relevant
roles (editors, ...)
