> This project is maintained in the [silverback monorepo](https://github.com/AmazeeLabs/silverback-mono)
# Amazee Silverback

`amazee/silverback-cli` is a composer package adding tooling and configuration scaffolding to Amazee Drupal projects. It aims to improve product quality and reduce maintenance costs by encouraging three simple principles:

1. **Maximize open source:** Lower initial costs, technical debt and maintenance costs by using and contributing to open source code as much as possible. For every feature required by a project that is not solvable by configuration or theming, try to find a generic solution that can be contributed.
2. **Minimize requirements:** It has to be as easy as possible to work on a project. If you need the production database and a local elasticsearch cluster to edit CSS files, you are doing microservices terribly wrong. _Example:_ By default silverback development sites run on SQLite. MySQL is considered a performance optimization, and it's not in the projects scope to test Drupal's database abstraction layer.
3. **Testability first:** A project has to be fully testable with only the git repository at any time. All required assets (test content, media, configuration) have to be set up during the installation process. It **must not** rely on production data. Every feature and bug fix has to bring a test case that can be reproduced. It might take more time initially, but it will pay off.

## Installation

```sh
composer require amazeelabs/silverback-cli
./vendor/bin/silverback init
direnv allow
```

## Usage

```sh
silverback list
silverback help [<command_name>]
```
