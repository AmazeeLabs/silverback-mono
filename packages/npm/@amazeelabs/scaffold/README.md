# Amazee Package Scaffolder

Scaffold code packages. Automatically adds and configures code quality and
testing tools.

## Installation

```shell
npx @amazeelabs/scaffold
```

This will alter the packages `.gitignore` file, add a `prepare` hook and make
sure that configurations for code quality tools like `eslint`, `prettier` or
`jest` are in place.

## Usage

After install there is a `test` that should run all tests in a package. Tests
are split into three categories (scripts):

1. `test:static` will do static code analysis like `eslint` or `typescript`
2. `test:unit` executes fast running unit tests
3. `test:integration` is supposed to be used for long-running integration tests
