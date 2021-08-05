# Silverback Gatsby

A Drupal module that provides integration endpoints for the
[`@amazeelabs/gatsby-source-silverback`][gatsby-source-silverback] Gatsby
plugin. Allows writing custom GraphQL schema definitions based on GraphQL V4 and
automatically send incremental updates to Gatsby.

[gatsby-source-silverback]:
  https://www.npmjs.com/package/@amazeelabs/gatsby-source-silverback

## Getting started

First, simply install and enable the module.

```shell
composer require amazeelabs/silverback_gatsby
drush en -y silverback_gatsby
```

Now create a [new GraphQL schema plugin][plugin] and make sure to use
`\Drupal\silverback_gatsby\GraphQL\ComposableSchema` as its base class. Use the
`@entity` directive to relate a GraphQL type to a Drupal entity type and bundle.

[plugin]:
  https://drupal-graphql.gitbook.io/graphql/v/8.x-4.x/getting-started/custom-schema

```graphql
schema {
  query: Query
}

type Query

type Page @entity(type: "node", bundle: "page") {
  path: String!
  title: String!
  body: String
}
```

Even if the schema does not provide root-level fields, you need to declare an
empty `Query` type. The schema extension will automatically extend it with the
GraphQL fields necessary for Gatsby to fetch this type. The directive will also
tell Drupal to send incremental updates to Gatsby whenever an entity of this
type changes. All you have to take care of in your own schema implementation are
the fields that you specifically defined.

```php
<?php
namespace Drupal\silverback_gatsby_example\Plugin\GraphQL\Schema;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\graphql\GraphQL\ResolverRegistryInterface;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;

/**
 * @Schema(
 *   id = "silverback_gatsby_example",
 *   name = "Silverback Gatsby Example Schema",
 * )
 */
class SilverbackGatsbyExampleSchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistryInterface {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();

    $registry->addFieldResolver('Page', 'path',
      $builder->compose(
        $builder->produce('entity_url')->map('entity', $builder->fromParent()),
        $builder->produce('url_path')->map('url', $builder->fromParent())
      )
    );
    $registry->addFieldResolver('Page', 'title',
      $builder->produce('entity_label')->map('entity', $builder->fromParent())
    );

    return $registry;
  }
}

```

Now you can create a new GraphQL server in Drupal based on your schema plugin.
Just make sure to tick the checkbox to enable the _Silverback Gatsby_ extension.
The _Explorer_ or _Voyager_ screens should show root level fields for loading
and querying our type (`loadPage`, `queryPages`) that you should be able to test
now.

## Automatic creation of Gatsby pages

Available using `@path` and `@template` field directives. See
[`@amazeelabs/gatsby-source-silverback`](../../../npm/@amazeelabs/gatsby-source-silverback)
plugin README for details.

## Automatic resolvers

There are directives which create GraphQL resolvers automatically.

### @property

This field directive is a shortcut for `property_path` data producer.

For example, this schema

```graphql
type Page @entity(type: "node", bundle: "page") {
  body: String @property(path: "field_body.0.processed")
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

## Menus

To expose Drupal menus to Gatsby, one can use the `@menu` directive. It takes a
menu id, and a menu item type name as arguments. The latter is used to declare a
GraphQL type in the schema that will be emitted from the menu's `items` field.

```graphql
type MainMenu @menu(menu_id: "main", item_type: "MenuItem")

type MenuItem {
  label: String!
  url: String!
}
```

The resolvers for custom field of menu items (in this case `label` and `url`)
still need to be provided by the schema implementation.

```php
$registry->addFieldResolver('MenuItem', 'label', $builder->compose(
  $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
  $builder->produce('menu_link_label')->map('link', $builder->fromParent()),
));

$registry->addFieldResolver('MenuItem', 'url', $builder->compose(
  $builder->produce('menu_tree_link')->map('element', $builder->fromParent()),
  $builder->produce('menu_link_url')->map('link', $builder->fromParent()),
  $builder->produce('url_path')->map('url', $builder->fromParent()),
));
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
optimize caching and Gatsby build times.  
In many cases, the main page layout only displays the first level of menu items.
When a new page is created and attached to the third level, Gatsby will still
re-render all pages, because the menu that is used in the header changed. By
separating this into two levels, we can make sure the outer layout really only
changes when menu levels are changed that are displayed.

```graphql
type MainMenu @menu(menu_id: "main", item_type: "MenuItem")
# Will only include the first level and trigger updates when a first level item
# changes.
type LayoutMainMenu @menu(menu_id: "main", item_type: "MenuItem", max_level: 1)
```

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
