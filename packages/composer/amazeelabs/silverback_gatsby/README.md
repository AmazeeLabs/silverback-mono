# Silverback Gatsby

A Drupal module that provides integration endpoints for the
[`@amazeelabs/gatsby-source-silverback`][gatsby-source-silverback] Gatsby
plugin. Allows writing custom GraphQL schema definitions based on GraphQL V4 and
automatically send incremental updates to Gatsby.

[gatsby-source-silverback]:
  https://www.npmjs.com/package/@amazeelabs/gatsby-source-silverback

## BREAKING CHANGES

In version 2, a couple of breaking changes have been introduced due to the new
dependency on the `graphql_directives` module.

- `@resolveEntityReference` and `@resolveEntityReferenceRevisions` do not
  support the `single` parameter any more. They can be chained with `@seek`
  instead.
- Gutenberg directives moved to the `silverback_gutenberg` module and changed in
  naming and parameters. Refer to the generated directives for more information.
- New default value handling requires either nullable custom type invocations,
  or `@default` directives on them. Refer to the `graphql_directives` module for
  more information.

## Getting started

First, simply install and enable the module.

```shell
composer require amazeelabs/silverback_gatsby
drush en -y silverback_gatsby
```

Create a GraphQL folder at the root of your project. This will contain all the
schema definitions. To improve IDE support, you can export all the schema
definitions in a single file:

```shell
drush graphql:directives > graphql/directives.graphqls
```

It is advised to ignore this file in version control and rather re-create it
when needed.

Now you can start to create the project schema defintion and fill in resolvers
by using the directives provided.

```graphql
schema {
  query: Query
}

type Query {
  page(id: String!): Page @loadEntity(type: "node", id: "$id")
}

type Page @entity(type: "node", bundle: "page") {
  path: String! @resolveEntityPath
  title: String! @resolveEntityLabel
  body: String @resolveProperty(path: "body.value")
}
```

Now create a new GraphQL server configuration, use the `Directable` schema
plugin and make sure to enable the "Silverback Gatsby" extension. The _Explorer_
or _Voyager_ screens should show root level fields for loading and querying our
type (`loadPage`, `queryPages`) that you should be able to test now.

## Automatic creation of Gatsby pages

Available using `@isPath` and `@isTemplate` field directives. See
[`@amazeelabs/gatsby-source-silverback`](../../../npm/@amazeelabs/gatsby-source-silverback)
plugin README for details.

## Automatic resolvers

There are directives which create GraphQL resolvers automatically.

### @resolveProperty

This field directive is a shortcut for `property_path` data producer.

For example, this schema

```graphql
type Page @entity(type: "node", bundle: "page") {
  body: String @resolveProperty(path: "field_body.0.processed")
}
```

Will create the following resolver for `Page.body` field

```php
$builder->produce('property_path', [
  'path' => $builder->fromValue('field_body.0.processed'),
  'value' => $builder->fromParent(),
  'type' => $builder->fromValue('entity:node:page'),
])
```

### @resolveEntityPath

Resolves the relative path to an entity. A shortcut for `entity_url`+`url_path`
data producers.

Example:

```graphql
type Page @entity(type: "node", bundle: "page") {
  path: String! @resolveEntityPath
}
```

### @resolveEntityReference

Resolves the references entities. A shortcut for `entity_reference` data
producer.

Example:

<!-- prettier-ignore-start -->
```graphql
type Page @entity(type: "node", bundle: "page") {
  relatedArticles: [Article]! @resolveEntityReference(field: "field_related_articles", single: false)
  parentPage: Page @resolveEntityReference(field: "field_related_articles", single: true)
}
```
<!-- prettier-ignore-end -->

### @resolveEntityReferenceRevisions

Resolves the entity reference revisions fields, e.g. Paragraphs. A shortcut for
`entity_reference_revisions` data producer.

Example:

<!-- prettier-ignore-start -->
```graphql
type Page @entity(type: "node", bundle: "page") {
  paragraphs: [PageParagraphs!]! @resolveEntityReferenceRevisions(field: "field_paragraphs", single: false)
  singleParagraph: ParagraphText @resolveEntityReferenceRevisions(field: "field_single_paragraph", single: true)
}
```
<!-- prettier-ignore-end -->

## Menus

To expose Drupal menus to Gatsby, one can use the `@menu` directive.

```graphql
type MainMenu @menu(menu_id: "main") {
  items: [MenuItem!]! @resolveMenuItems
}

type MenuItem {
  id: String! @resolveMenuItemId
  parent: String! @resolveMenuItemId
  label: String! @resolveMenuItemLabel
  url: String! @resolveMenuItemUrl
}
```

GraphQL does not allow recursive fragments, so something like this would not be
possible:

```graphql
query Menu {
  drupalMainMenu {
    items {
      ...MenuItem
    }
  }
}
fragment MenuItem on MenuItem {
  label
  url
  children {
    # Fragment recursion, not allowed in GraphQL!
    ...MenuItem
  }
}
```

That's why the menu tree is automatically flattened, and `id` and `parent`
properties are added to each item, so the tree can easily be reconstructed in
the consuming application.

```graphql
query MainMenu {
  drupalMainMenu(langcode: { eq: "en" }) {
    items {
      id
      parent
      label
      url
    }
  }
}
```

The `@menu` directive also takes an optional `max_level` argument. It can be
used to restrict the number of levels a type will include, which in turn can
optimize caching and Gatsby build times. In many cases, the main page layout
only displays the first level of menu items. When a new page is created and
attached to the third level, Gatsby will still re-render all pages, because the
menu that is used in the header changed. By separating this into two levels, we
can make sure the outer layout really only changes when menu levels are changed
that are displayed.

```graphql
type MainMenu @menu(menu_id: "main") {...}
# Will only include the first level and trigger updates when a first level item
# changes.
type LayoutMainMenu @menu(menu_id: "main", max_level: 1) {...}
```

### Menu negotiation

In some cases, the same GraphQL field might have to return different menus,
based on the current context. A prominent use case would be a multi-site setup
where different menus should be displayed based on the current account Gatsby is
using to fetch data with.

In this case, multiple menu id's can be passed to the `@menu` directive, and the
resolver will pick **the first one** that is accessible to the user account.

```graphql
type MainMenu
  @menu(menu_ids: ["site_a_main", "site_b_main"], item_type: "MenuItem")
```

It checks access for the `view label` operation on the `Menu` entity, which is
allowed for everybody by default. The consuming project has to implement other
mechanisms to restrict access therefore control which menus are used for which
site.

## Configuring update notifications

The last thing to do is to tell Gatsby whenever something noteworthy changes. By
using the `@entity` directive in our schema, we already told Drupal to keep
track of all changes related to the entity types we care about. All there is
missing is a Gatsby webhook url to trigger a refresh. We provide this via an
environment variable that is named after our configured GraphQL server.

```dotenv
GATSBY_BUILD_HOOK_[uppercased-server-id]=https://...
```

So if the server was called `My Server` and the automatically generated machine
name is `my_server`, then the environment variable would look like this:

```dotenv
GATSBY_BUILD_HOOK_MY_SERVER=https://...
```

The value is a semicolon-separated list of urls that will be called in case of
an update. This can be `http://localhost:8000/__refresh`, for local testing a
Gatsby environment with `ENABLE_GATSBY_REFRESH_ENDPOINT=true`, or the build and
preview webhooks provided by Gatsby Cloud.

The Gatsby site has to contain the
[`@amazeelabs/gatsby-source-silverback`][gatsby-source-silverback] plugin for
this to work.

## Access control

By default, [`@amazeelabs/gatsby-source-silverback`][gatsby-source-silverback]
behaves like an anonymous user. To change that, simply create a user account
with the required permissions and pass the credentials to the `auth_user` and
`auth_pass` configuration options of the plugin.

A very common use case would be to create a "preview" user that bypasses content
access control and use it for the "Preview" environment on Gatsby cloud, so
unpublished content can be previewed. Another sensible case would be to create a
"build" user that has access to published content and block anonymous access to
Drupal entirely.

## Trigger a build

There are multiple ways to trigger a Gatsby build:

- on entity save
- via the Drupal UI or Drush.

### On entity save

On the _Build_ tab of the schema configuration, check the _Trigger a build on
entity save_ checkbox.

### Drupal UI

On the same _Build_ tab, click the _Gatsby Build_ button.

### Drush

This command can be configured in the system cron.
`drush silverback-gatsby:build [server_id]`
