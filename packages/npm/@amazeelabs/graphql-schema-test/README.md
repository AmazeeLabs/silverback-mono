# GraphQL Schema Test

The package takes a set of `.gql` files, runs them against each endpoint defined
in `.graphqlconfig` and creates snapshots containing the responses. Jest used as
a test runner.

## Usage

Add the package to a project:

```
yarn add --dev @amazeelabs/graphql-schema-test jest
```

Create a Jest test file:

```js
const {
  listFiles,
  createExecutor,
} = require('@amazeelabs/graphql-schema-test');

execute = createExecutor('path/to/.graphqlconfig/file', myOptionalSerializer);
test.each(listFiles('path/to/queries/dir'))('%s', async (_, path) => {
  await execute(path);
});

function myOptionalSerializer(responses) {
  // serialize data in responses
}
```

Run tests:

```
yarn jest --testMatch '<rootDir>/path/to/my/test/file.js'
```

For an example, see
[apps/silverback-drupal/generated/\_\_tests\_\_](../../../../apps/silverback-drupal/generated/__tests__).

## PhpStorm

If you are a PhpStorm user and have the GraphQL plugin installed, you are very
lucky :) Because you can easily test your queries against any endpoint:

![Run queries in PhpStorm](docs/phpstorm.png)

## Usage in CI

For a Drupal based example, see `test:integration` script in
[apps/silverback-drupal/package.json](../../../../apps/silverback-drupal/package.json).
