# GraphQL Schema Test

The package takes a set of `.gql` files, runs them against each endpoint defined
in `.graphqlconfig` and creates snapshots containing the responses.

## Usage

Add the package to a project:

```
yarn add --dev @amazeelabs/graphql-schema-test
```

Run tests:

```
yarn graphql-schema-test path/to/directory
```

Available flags:

- `--verbose` (`-v`)
- `--updateSnapshot` (`-u`)

The directory should have the following structure:

- `__tests__`: Directory containing queries in `.gql` files.
- `.graphqlconfig`: GraphQL endpoints definition.
- `serializer.js`: Optional. Serializer for responses.

For an example, see
[apps/silverback-drupal/generated](../../../../apps/silverback-drupal/generated).

## PhpStorm

If you are a PhpStorm user and have the GraphLQ plugin installed, you are very
lucky :) Because you can easily test your queries against any endpoint:

![Run queries in PhpStorm](docs/phpstorm.png)

## Usage in CI

For a Drupal based example, see `test:integration` script in
[apps/silverback-drupal/package.json](../../../../apps/silverback-drupal/package.json).
