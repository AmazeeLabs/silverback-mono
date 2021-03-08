# Amazee Package Scaffolder

Scaffold code packages. Automatically adds and configures code quality and
testing tools.

## Installation

```shell
yarn add @amazeelabs/scaffold
yarn amazee-scaffold
```

This will alter the packages `.gitignore` file, add a `postinstall` hook and
make sure that configurations for code quality tools like `eslint`, `prettier`
or `jest` are in place. The scaffolded configuration files should are added to
`.gitignore` and should not be committed. They will be auto-added and updated
with every `yarn install`.

## Usage

After install there is a `test` npm script that will run tests either in CI-mode
or in watch-mode, depending on the current environment. It will also look for an
optional `test.sh` in the package root that will also be executed when running
in an CI environment.
