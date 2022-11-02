# GraphQL Directives

A directive-based approach to GraphQL schema implementations. Provides a 'Directable' schema plugin that loads a GraphQL schema definition file and implements it using directive plugins.

## Usage

Create a GraphQL schema definition file, and annotate it with directives.

```graphql
type Query {
  hello: String @value(json: "\"Hello world!\"")
}
```

Configure a GraphQL server with the "Directable" schema plugin, and set the
schema definition path to the created schema file.

Directive definitions will be automatically prepended to the schema. To support
IDE's with autocompletion and syntax checking, there is a `drush` command to
generate a schema file with all directives.

```shell
drush graphql:directives >> directives.graphqls
```

## Directives

### `@value`

The `@value` directive allows you to define a static value for a field as a JSON
encoded string.

```graphql
type Query {
  hello: String @value(json: "\"Hello world!\"")
}
```

## Extending

To add custom directives, create a module and add new Plugins in the
`src/Plugin/GraphQL/Directive` directory. The plugins "id" will be the handle to
invoke it in the schema, without the `@` prefix.

```php
<?php
namespace Drupal\my_directives\Plugin\GraphQL\Directive;

use Drupal\graphql_directives\DirectiveInterface;

/**
* @Directive(
*   id="echo",
*   arguments = {
*     "input" = "String!",
*   }
* )
 */
class EchoDirective extends PluginBase implements DirectiveInterface {
  /**
   * {@inheritdoc}
   */
  public function buildResolver(
    ResolverBuilder $builder,
    array $arguments
  ) : ResolverInterface {
    return $builder->fromValue($arguments['input']);
  }
}
```
