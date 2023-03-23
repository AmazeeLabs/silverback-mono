# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.5](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/graphql_directives@2.0.4...@-amazeelabs/graphql_directives@2.0.5) (2023-03-23)

**Note:** Version bump only for package @-amazeelabs/graphql_directives

# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.4](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/graphql_directives@2.0.3...@-amazeelabs/graphql_directives@2.0.4) (2023-01-30)

**Note:** Version bump only for package @-amazeelabs/graphql_directives

# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.3](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/graphql_directives@2.0.2...@-amazeelabs/graphql_directives@2.0.3) (2023-01-24)

**Note:** Version bump only for package @-amazeelabs/graphql_directives

# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.2](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/graphql_directives@2.0.1...@-amazeelabs/graphql_directives@2.0.2) (2023-01-07)

**Note:** Version bump only for package @-amazeelabs/graphql_directives

# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [2.0.1](https://github.com/AmazeeLabs/silverback-mono/compare/@-amazeelabs/graphql_directives@2.0.0...@-amazeelabs/graphql_directives@2.0.1) (2023-01-07)

**Note:** Version bump only for package @-amazeelabs/graphql_directives

# Change Log

All notable changes to this project will be documented in this file. See
[Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# 2.0.0 (2023-01-06)

### Bug Fixes

- **graphql:** add missing config schema for extensions
  ([f88efec](https://github.com/AmazeeLabs/silverback-mono/commit/f88efec1f9b9cf29dbc5b3e62c2645dc690e6edb))
- **graphql:** append extension document to printed schema
  ([d0ec3ca](https://github.com/AmazeeLabs/silverback-mono/commit/d0ec3ca4b312fc5c9317ee3ccbd251b48873064b))
- **graphql:** directable schema configuration form handling
  ([0509a2c](https://github.com/AmazeeLabs/silverback-mono/commit/0509a2c4c418f986e7eb5746bdb1f842048b76c6))
- **graphql:** gracefully handle non-existent schema files
  ([8c75f73](https://github.com/AmazeeLabs/silverback-mono/commit/8c75f737ce45572f0f2904a56feeb270df9d4721))
- **graphql:** include existing extension definitions in directable schema
  extension
  ([e457ecc](https://github.com/AmazeeLabs/silverback-mono/commit/e457eccf2bd54062c911dc78319a0fb4333598f0))
- **graphql:** make schema definition and extensions public
  ([d548085](https://github.com/AmazeeLabs/silverback-mono/commit/d548085518a19d826568a2dae1aaa05d3cef501a))
- **graphql:** mark all directives as repeatable
  ([577647c](https://github.com/AmazeeLabs/silverback-mono/commit/577647c49639486d40e51494f6d10794eb13aff2))
- **graphql:** sort printed directives to achieve deterministic output
  ([02f2324](https://github.com/AmazeeLabs/silverback-mono/commit/02f2324ccf7e2a35c1140c06bcd5690d0ae56dac))
- **graphql:** switch to php 8.1 and issues caused by that
  ([dac9048](https://github.com/AmazeeLabs/silverback-mono/commit/dac9048f133d5d90aef9b98cea576c1c5e9401c5))

### Code Refactoring

- **graphql:** deprecate ComposableSchema
  ([e04d3eb](https://github.com/AmazeeLabs/silverback-mono/commit/e04d3eb0f3486215a5dd344bc5a22309606690e5))
- **graphql:** streamline default value behaviour
  ([81c9bff](https://github.com/AmazeeLabs/silverback-mono/commit/81c9bffebd6b6bdc4dd5a53b21387e462ebc44fc))

### Features

- **graphql:** add base class for parent aware schema extensions
  ([b8acd2c](https://github.com/AmazeeLabs/silverback-mono/commit/b8acd2c71ff2ac58e578c46f8bee900b82d35c5a))
- **graphql:** add map directive to schema definition
  ([75261ad](https://github.com/AmazeeLabs/silverback-mono/commit/75261adab107055ffa2dea359303d197ec11f488))
- **graphql:** attach provider information to printed directives
  ([660355d](https://github.com/AmazeeLabs/silverback-mono/commit/660355dfa0bce59fdefa065afc6e914135534716))
- **graphql:** default directive
  ([84efe18](https://github.com/AmazeeLabs/silverback-mono/commit/84efe181643492c39789b09c6b255e16ef5ac2dc))
- **graphql:** define access operation in entity load directive
  ([b64f7ae](https://github.com/AmazeeLabs/silverback-mono/commit/b64f7ae466a0f42f8ef45d8ecafa76d6373559fa))
- **graphql:** directives for entity language
  ([9336a97](https://github.com/AmazeeLabs/silverback-mono/commit/9336a97ca1a9b426f7c9c8450c49d84be9d2f345))
- **graphql:** directives for entity properties
  ([a111143](https://github.com/AmazeeLabs/silverback-mono/commit/a1111439af3eeffcec05b7864377ceb381df102c))
- **graphql:** directives for entity translations
  ([79aa654](https://github.com/AmazeeLabs/silverback-mono/commit/79aa654d72530716f4a5be6cafc0a35e72695c74))
- **graphql:** directives for loading entities
  ([5d6d3e6](https://github.com/AmazeeLabs/silverback-mono/commit/5d6d3e6f4364c11c2b0f020575d6166665125f40))
- **graphql:** directives for primitive entity properties
  ([2cb8e2e](https://github.com/AmazeeLabs/silverback-mono/commit/2cb8e2efda4bb6cb514979716944c3b974140766))
- **graphql:** drush command for exporting directives file
  ([b5823a5](https://github.com/AmazeeLabs/silverback-mono/commit/b5823a5153a8218a1ceb7b6032d762eb84ee3888))
- **graphql:** extract directive plugins for entity references
  ([fdad8fd](https://github.com/AmazeeLabs/silverback-mono/commit/fdad8fde3678a43d4af3d87e62fc2a9ed23dcff3))
- **graphql:** fundamental directable schema plugin
  ([82ff2b2](https://github.com/AmazeeLabs/silverback-mono/commit/82ff2b2b27fda7ea42ea70a72fabc682507cae6c))
- **graphql:** implement directive-based type resolution
  ([5936038](https://github.com/AmazeeLabs/silverback-mono/commit/5936038371ce04146f6d29cc40878d6b30f296d7))
- **graphql:** implement map directive
  ([e698e27](https://github.com/AmazeeLabs/silverback-mono/commit/e698e27bbabe95bce5ecdc36fca9290c2dc57fd8))
- **graphql:** prop directive
  ([2a18c8d](https://github.com/AmazeeLabs/silverback-mono/commit/2a18c8d7001fa5962b31cae734b49186e9a77663))
- **graphql:** seek directive and chaining
  ([dfc1938](https://github.com/AmazeeLabs/silverback-mono/commit/dfc1938f641ad7e3a2921b001305a3c45fb86942))
- **graphql:** sketch type resolution system
  ([ef9029e](https://github.com/AmazeeLabs/silverback-mono/commit/ef9029ef40708528a27c4762d61338436311869b))
- **graphql:** support directive descriptions
  ([c360786](https://github.com/AmazeeLabs/silverback-mono/commit/c36078611099ef66a56f9147d9156dd316dfef3e))
- **graphql:** support lists as directive arguments
  ([02c7bac](https://github.com/AmazeeLabs/silverback-mono/commit/02c7bac58e830c6cb14b2a175a72a0f364186a4d))
- **graphql:** value directive for setting arbitrary values
  ([c68246f](https://github.com/AmazeeLabs/silverback-mono/commit/c68246f58f28b04fc93703a419d69d6588b1a3c4))

### BREAKING CHANGES

- **graphql:** GraphQL field return types of custom types require either a
  @default definition, or have to be nullable.
- **graphql:** composable schemas need a configured schema definition
