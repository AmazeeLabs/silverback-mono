# Create a Drupal CMS

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

## Requirements

We need `composer` _2_.

```typescript
$$('composer --version', {
  stdout: $$.minimalVersion('2'),
});
```

## Basic setup

```typescript
$$('cat README.md', {
  stdout: /Executed `create-monorepo`/,
});

const { name: projectName } = $$.file('package.json');

$$.vars({
  projectName,
});
```

To initiate a Drupal content management system, we first create a vanilla Drupal
project with the official composer template.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('composer create-project drupal/recommended-project cms');
$$.chdir('cms');
```

Get rid of Drupal's welcome message.

```typescript
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'post-create-project-cmd-message': undefined,
  },
}));
$$('composer remove drupal/core-project-message');
```

Allow Composer plugins execution.

```typescript
$$.file('composer.json', (json) => ({
  ...json,
  config: {
    ...json.config,
    'allow-plugins': {
      'composer/installers': true,
      'cweagans/composer-patches': true,
      'drupal/core-composer-scaffold': true,
    },
  },
}));
```

Create a `.gitignore` file that ignores composer dependencies in `vendor`,
Drupal core in `web/core` and contributed modules and themes in
`web/modules/contrib` and `web/themes/contrib`.

```ignore
# |-> .gitignore
# Composer
/vendor

# Drupal
/.editorconfig
/.gitattributes
/web/*
!/web/modules
!/web/themes
/web/modules/*
/web/themes/*
!/web/modules/custom
!/web/themes/custom

# Lagoon integrations
/drush
/.drush-lock-update

# Silverback
/.env.local
/.env.local.example
/.envrc
/.silverback-snapshots
.phpunit.result.cache
```

We maintain a package for common Drupal core patches that should be added
upfront. This will make sure that you won't have to maintain patches in this
project on your own. We also need to make sure patching is enabled and that
broken patches will fail any deployments.

```typescript
$$('composer require amazeelabs/proxy-drupal-core');
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'enable-patching': true,
    'composer-exit-on-patch-failure': true,
  },
}));
// Make sure the patches are applied to core.
$$('rm -rf web/core && composer install');
```

Install Drush.

```typescript
// Use version 10 as Lagoon's drupal_integrations module does not support Drush
// 11 yet.
// TODO: Remove ":^10" once https://github.com/amazeeio/drupal-integrations/issues/7 is resolved.
$$('composer require drush/drush:^10');
```

To integrate better with the Javascript development process, we make the `cms`
app a yarn package too.

```typescript
$$('yarn init -p -y');
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/cms`,
  description: `Content management system for ${projectName.toUpperCase()}`,
}));
```

## Minimal Drupal setup

Drupal needs some essential settings to work. We are going to append them to the
standard `setting.php` file.

```typescript
$$('mkdir -p scaffold');
const crypto = require('crypto');
$$.vars({
  hashSalt: crypto.randomBytes(20).toString('hex'),
});
```

```txt
// |-> scaffold/settings.php.append.txt

// Basic settings
$settings['hash_salt'] = '{{hashSalt}}';
$settings['config_sync_directory'] = '../config/sync';
$settings['file_private_path'] = $app_root . '/sites/default/files/private';
```

```typescript
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'drupal-scaffold': {
      ...json.extra['drupal-scaffold'],
      'file-mapping': {
        ...(json.extra['drupal-scaffold']['file-mapping'] || {}),
        '[web-root]/sites/default/settings.php': {
          append: 'scaffold/settings.php.append.txt',
        },
      },
    },
  },
}));
```

Commit.

```typescript
$$('git add .');
$$('git commit -m "chore: basic drupal setup"');
```

## Lagoon

Most or our Drupal projects are hosted on [Lagoon], so we should prepare this
one for that. There is a `amazeeio/drupal_integrations` composer package, that
will do the heavy lifting. Like `amazeelabs/silverback-cli` it relies on
[drupal-scaffold] and has to be added to the list of allowed packages.

[lagoon]: https://docs.lagoon.sh/lagoon/

```typescript
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'drupal-scaffold': {
      ...json.extra['drupal-scaffold'],
      'allowed-packages': [
        ...(json.extra['drupal-scaffold']['allowed-packages'] || []),
        'amazeeio/drupal_integrations',
      ],
    },
  },
}));
```

Simply install the `amazeeio/drupal_integrations` package, and we are almost
good to go.

```typescript
$$('composer require amazeeio/drupal_integrations');
```

[Lagoon] still requires configuration for its services. We put these at the
repository root, so they have access to the full codebase.

```typescript
$$.chdir('../../');
```

First we drop the `docker-compose.yml` with the definition of the services we
need. Those are a NGINX webserver, a PHP runtime and a MariaDB database host.

```yaml
# |-> docker-compose.yml
version: '2.3'

x-lagoon-project:
  # Lagoon project name (leave `&lagoon-project` when you edit this)
  &lagoon-project '{{projectName}}'

x-drupal-volumes:
  &drupal-volumes # Define all volumes you would like to have real-time mounted into the drupal docker containers
  volumes:
    - .:/app:delegated

x-environment: &default-environment
  LAGOON_PROJECT: *lagoon-project
  LAGOON_ENVIRONMENT_TYPE: production
  LAGOON_ROUTE: http://cms.{{projectName}}.docker.amazee.io
  LAGOON_LOCALDEV_URL: cms.{{projectName}}.docker.amazee.io

services:
  cli:
    build:
      context: .
      dockerfile: .lagoon/cli.Dockerfile
    image: *lagoon-project
    labels:
      lagoon.type: cli-persistent
      lagoon.persistent.name: nginx
      lagoon.persistent: /app/apps/cms/web/sites/default/files/
    <<: *drupal-volumes
    volumes_from:
      - container:amazeeio-ssh-agent
    environment:
      <<: *default-environment

  nginx:
    build:
      context: .
      dockerfile: .lagoon/nginx.Dockerfile
      args:
        CLI_IMAGE: *lagoon-project
    labels:
      lagoon.type: nginx-php-persistent
      lagoon.persistent: /app/apps/cms/web/sites/default/files/
    <<: *drupal-volumes
    volumes_from:
      - container:amazeeio-ssh-agent
    depends_on:
      - cli
    environment:
      <<: *default-environment
    networks:
      - amazeeio-network
      - default

  php:
    build:
      context: .
      dockerfile: .lagoon/php.Dockerfile
      args:
        CLI_IMAGE: *lagoon-project
    labels:
      lagoon.type: nginx-php-persistent
      lagoon.name: nginx
      lagoon.persistent: /app/apps/cms/web/sites/default/files/
    <<: *drupal-volumes
    depends_on:
      - cli
    environment:
      <<: *default-environment

  mariadb:
    image: amazeeio/mariadb-drupal
    labels:
      lagoon.type: mariadb
    ports:
      - '3306'
    environment:
      <<: *default-environment

networks:
  amazeeio-network:
    external: true
```

We also need a `.lagoon.yml` configuration file with the definition of
post-rollout tasks and cronjobs.

```yaml
# |-> .lagoon.yml
docker-compose-yaml: docker-compose.yml

project: '{{projectName}}'

tasks:
  post-rollout:
    - run:
        name: Install Drupal if necessary
        command: |
          if [[ ${LAGOON_GIT_SAFE_BRANCH} == "dev" ]] && ! drush status --fields=bootstrap | grep -q "Successful"; then
            drush si minimal -y --existing-config --account-name admin
          fi
        service: cli
    - run:
        name: Run Drupal deploy tasks
        command: drush -y deploy
        service: cli

environments:
  dev:
    cronjobs:
      - name: drush cron
        schedule: '*/15 * * * *'
        command: drush cron
        service: cli
  prod:
    cronjobs:
      - name: drush cron
        schedule: '*/15 * * * *'
        command: drush cron
        service: cli
```

This also references a couple of `Dockerfile`s we need to add.

```typescript
$$('mkdir .lagoon');
```

```dockerfile
# |-> .lagoon/cli.Dockerfile
FROM uselagoon/php-8.1-cli-drupal as builder

RUN apk add --no-cache git imagemagick && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl && \
  composer config --global github-protocols https

# Initiate the whole monorepo for the case if Drupal will need something from
# other yarn workspaces (e.g. CSS files for the editor).
COPY package.json yarn.lock /app/

COPY apps/cms/package.json /app/apps/cms/package.json
# You might need to copy package.json files from all workspaces.

# Yarn's postinstall scripts can be tricky, so we use --ignore-scripts flag. For
# the case if something required is missing, it can be built with `npm rebuild`
# after `yarn install`.
# Example:
# RUN yarn install --pure-lockfile --ignore-scripts --ignore-engines
# RUN npm rebuild node-sass
# RUN yarn lerna run prepare
RUN yarn install --pure-lockfile --ignore-scripts --ignore-engines
COPY . /app

WORKDIR /app/apps/cms
RUN composer install --prefer-dist --no-interaction

ENV WEBROOT=/app/apps/cms/web
```

```dockerfile
# |-> .lagoon/php.Dockerfile
ARG CLI_IMAGE
FROM ${CLI_IMAGE} as cli

FROM uselagoon/php-8.1-fpm
RUN apk add --no-cache git imagemagick && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl

COPY --from=cli /app/apps/cms /app/apps/cms
WORKDIR /app/apps/cms
ENV WEBROOT=apps/cms/web
```

```dockerfile
# |-> .lagoon/nginx.Dockerfile
ARG CLI_IMAGE
FROM ${CLI_IMAGE} as cli

FROM amazeeio/nginx-drupal

COPY --from=cli /app/apps/cms /app/apps/cms
ENV WEBROOT=apps/cms/web
```

```ignorelang
# |-> .dockerignore
**/node_modules
**/vendor
_local
```

Commit.

```typescript
$$('git add .');
$$('git commit -m "chore: lagoon setup"');
```

## Silverback CLI

[`silverback-cli`][silverback-cli] is a command line tool for rapid local Drupal
development. It can cache repeated site installations, manage database snapshots
and facilitate automated testing. It comes with configuration for
[drupal-scaffold] to initiate itself into the project. For that to work, we have
to add it to the list of allowed packages first.

[drupal-scaffold]: https://github.com/drupal/core-composer-scaffold
[silverback-cli]:
  https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/composer/amazeelabs/silverback-cli

```typescript
$$.chdir('apps/cms');
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'drupal-scaffold': {
      ...json.extra['drupal-scaffold'],
      'allowed-packages': [
        ...(json.extra['drupal-scaffold']['allowed-packages'] || []),
        // Add the package to the list so composer executes
        // the scaffold instructions it contains.
        'amazeelabs/silverback-cli',
      ],
    },
  },
}));
```

Now we can install `amazeelabs/silverback-cli` and everything it entails.

```typescript
$$('composer require amazeelabs/silverback-cli --with-all-dependencies');
```

If you have [direnv] installed, you should be able to run `direnv allow` and
afterwards `silverback setup --profile minimal` to install vanilla Drupal.

Now we can add some scripts to conveniently access common Drupal command line
tasks.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    drush: 'source .envrc && drush',
    silverback: 'source .envrc && silverback',
    prepare:
      'if php -v && [[ -z $LAGOON ]]; then composer install && SB_SETUP=1 yarn setup; fi',
    'drupal-install': 'yarn silverback setup --profile minimal',
    setup: 'yarn silverback setup',
    start: 'yarn drush serve',
    login: 'yarn drush uli',
  },
}));
```

The `prepare` script will now be triggered by yarn after running `yarn install`
and make sure that all composer dependencies are installed too. You can run
`yarn install`, to do a fresh Drupal install. Then you should be able to verify
it worked, but inspecting the output of `yarn drush status`.

```typescript
$$('yarn drupal-install');
$$('yarn drush status', {
  stdout: /Drupal bootstrap\s+:\s+Successful/,
});
```

The `yarn drupal-install` command should also have created a `install-cache.zip`
file which you can add to the repository. It will be used by `yarn setup` to
save time by not installing Drupal from scratch, but rather restoring the
database snapshot in there and running updates. This is also a great way to test
upgrade hooks.

```typescript
$$('ls -la', {
  stdout: /install-cache\.zip/,
});
```

```typescript
$$('yarn drush status', {
  stdout: /Drupal bootstrap\s+:\s+Successful/,
});
```

Over time the Drupal config will accumulate more and more changes, and
`yarn setup` will take longer again. Then you can run `yarn install` again to
create and updated version of `install-cache.zip` and commit it.

`yarn start` will start a local PHP development server, hosting the content
management system.

Commit.

```typescript
$$('yarn drush -y cex');
$$('git add .');
$$('git commit -m "chore: integrate amazeelabs/silverback-cli"');
```

[direnv]: https://direnv.net/

```typescript
$$.chdir('../../');
```

## Continuous integration

Adjust testing workflow.

```yml
# >-> .github/workflows/test.yml

      - name: Check if there are config changes after Drupal updates
        run: |
          set -e
          cd apps/cms
          source .envrc
          composer i
          silverback setup --no-config-import
          drush cex -y
          cd -
          if [[ $(git status --porcelain -- apps/cms/config ':!apps/cms/config/sync/language') ]]
          then
            >&2 echo 'Error: Found uncommitted Drupal config.'
            >&2 echo 'If it was due to a Drupal database update which changed the Drupal config: checkout this branch locally, switch to `apps/cms` dir, run `composer i && silverback setup --no-config-import && drush cex -y`, review the config changes, commit and push.'
            >&2 echo 'If it was an intentional change to the Drupal config: checkout this branch locally, switch to `apps/cms` dir, run `composer i && silverback setup --profile=minimal`, commit and push.'
            git status --porcelain -- apps/cms/config ':!apps/cms/config/sync/language'
            false
          else
            echo 'Success: Found no new config changes.'
          fi

  docker_build:
    name: Docker Build
    if: startsWith(github.head_ref, 'test-all/') == true
    runs-on: ubuntu-20.04
    steps:

      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Setup Ruby
        uses: ruby/setup-ruby@v1
        with:
          ruby-version: 2
          bundler-cache: true

      - name: Install Pygmy
        run: gem install pygmy

      - name: Start Pygmy
        run: pygmy up

      - name: Docker Build
        run: docker-compose build
```

Adjust lock-file-changes workflow.

<!-- prettier-ignore-start -->
```yml
# >-> .github/workflows/lock-file-changes.yml

      # composer.lock
      - name: Generate composer diff
        id: composer_diff
        uses: IonBazan/composer-diff-action@v1
        with:
          base: {{'${{ github.event.pull_request.base.sha }}:apps/cms/composer.lock'}}
          target: apps/cms/composer.lock
      - uses: marocchino/sticky-pull-request-comment@v2
        if: {{'${{ steps.composer_diff.outputs.composer_diff }}'}}
        with:
          header: composer-diff
          # Make the message look similar to the one produced by
          # Simek/yarn-lock-changes.
          message: |
            ## `composer.lock` changes

            <details>
            <summary>Click to toggle table visibility</summary>

            {{'${{ steps.composer_diff.outputs.composer_diff }}'}}

            </details>
      - uses: marocchino/sticky-pull-request-comment@v2
        if: {{'${{ steps.composer_diff.outputs.composer_diff == 0 }}'}}
        with:
          header: composer-diff
          delete: true
```
<!-- prettier-ignore-end -->

Commit.

```typescript
$$('git add .');
$$('git commit -m "ci: adjust github workflows for drupal"');
```

## Default content export/import

Let's add some helpers for exporting/importing the default content for local
development and testing.

We are going to use
[Default Content](https://www.drupal.org/project/default_content) module for
that.

```typescript
$$.chdir('apps/cms');
$$(
  'composer require amazeelabs/default-content drupal/default_content:^2.0@alpha',
);
$$('yarn drush -y en default_content');
```

Create a custom module which will keep the exported content.

```yml
# |-> web/modules/custom/{{projectName}}_default_content/{{projectName}}_default_content.info.yml

name: Default content for {{projectName}}
package: Custom
type: module
core_version_requirement: ^8.0 || ^9.0
dependencies:
  - default_content:default_content
```

```php
<?php
// |-> web/modules/custom/{{projectName}}_default_content/export.php

use AmazeeLabs\DefaultContent\Export;

if (PHP_SAPI !== 'cli') {
  die;
}

// The list of excluded content entity types.
$excluded = [
  // Path aliases are created automatically on the node creation. They cause
  // troubles if exported to the default content.
  'path_alias',
];

Export::run('{{projectName}}_default_content', $excluded);
```

```php
<?php
// |-> web/modules/custom/{{projectName}}_default_content/import.php

use AmazeeLabs\DefaultContent\Import;

if (PHP_SAPI !== 'cli') {
  die;
}

Import::run('{{projectName}}_default_content');
```

```php
<?php
// |-> web/modules/custom/{{projectName}}_default_content/{{projectName}}_default_content.install

/**
 * Implements hook_requirements().
 */
function {{projectName}}_default_content_requirements($phase) {
  return [
    'module' => [
      'title' => '{{projectName}}_default_content module should never be enabled',
      'description' => '{{projectName}}_default_content module should never be enabled',
      'severity' => REQUIREMENT_ERROR,
    ],
  ];
}
```

Register scripts in `package.json`.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'content:export': `source .envrc && drush php-script web/modules/custom/${projectName}_default_content/export.php`,
    'content:import': `source .envrc && drush php-script web/modules/custom/${projectName}_default_content/import.php`,
    setup: `${json.scripts.setup} && yarn content:import`,
  },
}));
```

Commit.

```typescript
$$('yarn drush -y cex');
$$(`git add .`);
$$('git commit -m "chore: default content scripts"');
```

## Configure Drupal

Drupal installed with the Minimal profile looks like a monster. Fix this.

```typescript
$$('yarn drush -y theme:enable seven');
$$('yarn drush -y config-set system.theme default seven');
$$('yarn drush -y theme:uninstall stark');
$$('yarn drush -y config:delete block.block.seven_tools');
$$('yarn drush -y config:delete block.block.seven_admin');
$$('yarn drush -y config:delete block.block.seven_branding');

$$('composer require drupal/admin_toolbar');
$$('yarn drush -y en admin_toolbar_tools admin_toolbar_search');
```

Also, get rid of some standard modules...

```typescript
$$('yarn drush -y pmu update');
```

And install the most commonly used ones.

```typescript
const modules = [
  'ckeditor',
  'block_content',
  'menu_link_content',
  'field_ui',
  'inline_form_errors',
  'media',
  'media_library',
  'menu_ui',
  'path',
  'shortcut',
  'taxonomy',
  'editor',
  'views',
  'views_ui',
  'datetime',
  'datetime_range',
  'file',
  'image',
  'link',
  'options',
  'telephone',
  'basic_auth',
];
$$(`yarn drush -y en ${modules.join(' ')}`);
```

Commit.

```typescript
$$('yarn drush -y cex');
$$('git add .');
$$('git commit -m "chore: configure drupal"');
```

## Add GraphQL schema

Add `drupal/graphql` and `amazeelabs/silverback_gatsby` modules.

```typescript
$$(
  'composer require amazeelabs/proxy-graphql drupal/typed_data:^1.0@alpha amazeelabs/silverback_gatsby',
);
$$('yarn drush -y en silverback_gatsby');
```

Create a custom module with a GraphQL schema.

```yml
# |-> web/modules/custom/{{projectName}}_graphql/{{projectName}}_graphql.info.yml

name: GraphQL schema for {{projectName}}
type: module
description: 'GraphQL schema for {{projectName}}.'
package: Custom
dependencies:
  - silverback_gatsby:silverback_gatsby
core_version_requirement: ^8 || ^9
```

```graphql
# |-> web/modules/custom/{{projectName}}_graphql/graphql/{{projectName}}_website.graphqls

schema {
  query: Query
}

type Query {
  exampleField: String!
}
```

```php
<?php
// |-> web/modules/custom/{{projectName}}_graphql/src/Plugin/GraphQL/Schema/WebsiteSchema.php

namespace Drupal\{{projectName}}_graphql\Plugin\GraphQL\Schema;

use Drupal\graphql\GraphQL\Resolver\ResolverInterface;
use Drupal\graphql\GraphQL\ResolverBuilder;
use Drupal\graphql\GraphQL\ResolverRegistry;
use Drupal\silverback_gatsby\GraphQL\ComposableSchema;

/**
 * @Schema(
 *   id = "{{projectName}}_website",
 *   name = "Website schema",
 * )
 */
class WebsiteSchema extends ComposableSchema {

  public function getResolverRegistry(): ResolverRegistry {
    $builder = new ResolverBuilder();
    $registry = new ResolverRegistry();
    $this->addFieldResolvers($registry, $builder);
    return $registry;
  }

  protected function addFieldResolvers(ResolverRegistry $registry, ResolverBuilder $builder): void {
    $addResolver = function(string $path, ResolverInterface $resolver) use ($registry) {
      [$type, $field] = explode('.', $path);
      $registry->addFieldResolver($type, $field, $resolver);
    };

    $addResolver('Query.exampleField', $builder->fromValue('OK'));
  }

}
```

Make it comfortable to work with the schema in PhpStorm.

```json
// |-> web/modules/custom/{{projectName}}_graphql/graphql/.graphqlconfig

{
  "name": "Project Schema",
  "schemaPath": "*.graphqls"
}
```

```typescript
$$(
  `cd web/modules/custom/${projectName}_graphql/graphql && ln -s ../../../contrib/silverback_gatsby/graphql silverback`,
);
```

Commit enable the module and commit changes.

```typescript
$$(`yarn drush -y en ${projectName}_graphql`);
```

Commit.

```typescript
$$('yarn drush -y cex');
$$('git add .');
$$('git commit -m "chore: graphql schema"');
```

## Finishing up

Update Drupal install cache.

```typescript
$$('yarn drupal-install');
```

Commit.

```typescript
$$('git add .');
$$('git commit -m "chore: update drupal install cache"');
```

As always, the repository should be clean now.

```typescript
$$('git status --porcelain', {
  stdout: (output) =>
    output.trim().length !== 0
      ? `uncommitted changes:\n${output}\n`
      : undefined,
});
```
