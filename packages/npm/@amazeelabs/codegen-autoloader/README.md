# Codegen Autoloader

A plugin for the [GraphQL Code Generator](https://the-guild.dev/graphql/codegen)
that scans a set of GraphQL schema files for directives that have been annotated
with implementations and generates files that can be consumed by GraphQL
implementations.

## Usage

Install the package `@amazeelabs/codegen-autoloader` and add it to your codegen
configuration:

```yaml
schema: 'schema.graphql'
generates:
  generated/js/directives.mjs:
    plugins:
      - '@amazeelabs/codegen-autoloader'
    context:
      - gatsby
    mode: 'js'
```

## Directives

To annotate a directive for auto-loading, add a block comment that includes a
line starting with `implementation:`.

```graphql
"""
implementation: @my-project/directives#my_echo
"""
directive @echo(msg: String!) repeatable on FIELD_DEFINITION
```

This will cause the autoloader to connect the `@echo` directive to the `my_echo`
function exposed by the `@my-project/directives` package.

If the implementation contains `::`, it will be considered a Drupal
implementation. It is possible to execute methods of either static classes
(`\Drupal\my_modules\Directives::myEcho`) or Symfony services
(`my_module.directives::myEcho`). This has only an effect if the output mode is
`drupal`.

## Contexts

Contexts allow to annotate a directive with different implementations that will
be applied, depending on the current execution context. The most prominent use
case would be to define implementations of a given function for Gatsby and
Drupal:

```graphql
"""
implementation(gatsby): @my-project/directives#my_echo
implementation(drupal): \Drupal\my_project\Directives::my_echo
"""
directive @echo(msg: String!) repeatable on FIELD_DEFINITION
```

The codegen configuration the could simply generate multiple a file for each
context:

```yaml
schema: 'schema.graphql'
generates:
  generated/js/directives.mjs:
    plugins:
      - '@amazeelabs/codegen-autoloader'
    context:
      - gatsby
    mode: 'js'
  generated/drupal/directives.json:
    plugins:
      - '@amazeelabs/codegen-autoloader'
    context:
      - drupal
    mode: 'drupal'
```

Multiple contexts can be specified using comma-separated values:

```graphql
"""
implementation(gatsby): @my-project/directives#responsiveImage
implementation(gatsby,cloudinary): @my-project/directives#responsiveImage
"""
directive @responsiveImage(url: String!) on FIELD_DEFINITION
```

An implementation will be picked when _all_ of the specified contexts match.

```yaml
schema: 'schema.graphql'
generates:
  generated/js/directives.mjs:
    plugins:
      - '@amazeelabs/codegen-autoloader'
    context:
      - gatsby
      - cloudinary
    mode: 'js'
```

## `@sourceFrom` support

The `@sourceFrom` from the `@amazeelabs/gatsby-source-silverback` directive
allows to specify Javascript functions that should be used to source data into
the Gatsby data store. This package will include these functions in the
autoloader output.

```graphql
type Page @sourceFrom(fn: "@my/package#pages") {
  title: String!
}
```

## Output modes

The `mode` configuration parameter allows to select the output mode. `js`
creates a javascript file that exports a default object with the directives.
`drupal` creates a JSON file with the directives that is compatible to
`amazeelabs/graphql_directives`.
