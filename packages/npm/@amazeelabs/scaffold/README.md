# Amazee Package Scaffolder

Scaffold code packages. Automatically adds and configures code quality and
testing tools.

## Installation

```shell
yarn add -D @amazeelabs/scaffold
yarn amazee-scaffold
```

This will alter the packages `.gitignore` file, add a `prepare` hook and make
sure that configurations for code quality tools like `eslint`, `prettier` or
`jest` are in place. The scaffolded configuration files are added to
`.gitignore` and should not be committed. They will be auto-added and updated
with every `yarn install`.

> **Alert:** When using this within the Silverback monorepo, yarn will falsely
> add the dependencies to `dependencies` instead of `devDependencies`. This has
> to be fixed manually until we are able to switch to a newer version of `yarn`.

## Usage

After install there is a `test` that should run all testsin a package. It will
also look for an optional `test.sh` in the package root that will also be
executed. The `watch` command should be used for live-feedback features (like
`jest --watch`).
