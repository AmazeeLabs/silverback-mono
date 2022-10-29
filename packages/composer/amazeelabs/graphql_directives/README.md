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
generate a schema file with all directives and information where they are
implemented.

```shell
drush graphql:directives >> directives.graphqls
```

### Chaining

Directives can be chained to combine reusable data producers. They are composed
from left to right, meaning the output of the left directive is passed as parent
value to its right neighbour.

```graphql
type Query {
  # This will emit "three".
  list: String! @value(json: "[\"one\", \"two\", \"three\"]") @seek(pos: 2)
}
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

### `@seek`

Extracts a value from a list or iterable. The `pos` argument marks the target
position.

```graphql
type Query {
  # This will emit "three".
  list: String! @value(json: "[\"one\", \"two\", \"three\"]") @seek(pos: 2)
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
*   description="Return the same string that you put in.",
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
