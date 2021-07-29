# Create a Drupal CMS

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

```typescript
$$('cat README.md', {
  stdout: /Executed `create-monorepo`/,
});

const { name: projectName } = $$.file('package.json');
```

To initiate a Drupal content management system, we first create a vanilla Drupal
project with the official composer template.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('composer create-project drupal/recommended-project cms');
$$.chdir('cms');
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

We maintain a package for common Drupal core patches that should be added upfront.
This will make sure that you won't have to maintain patches in this project on your
own. We also need to make sure patching is enabled and that broken patches will fail
any deployments.

```typescript
$$('composer require amazeelabs/proxy-drupal-core');
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    "enable-patching": true,
    "composer-exit-on-patch-failure": true,
  }
}))
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

Drush 9 or higher does not work with [Lagoon] out of the box. We have to place a
`lagoon.aliases.drushrc.php` in the drush folder. This folder is managed by
composer, so we add our file to [drupal-scaffold], so it is installed
automatically.

First we create the required file in the `scaffold` folder within the Drupal
directory.

```typescript
$$('mkdir -p scaffold');
```

```php
<?php
// |-> scaffold/lagoon.aliases.drushrc.php
// Don't change anything here, it's magic!
global $aliases_stub;
if (empty($aliases_stub)) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_AUTOREFERER, TRUE);
  curl_setopt($ch, CURLOPT_HEADER, 0);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
  curl_setopt($ch, CURLOPT_URL, 'https://drush-alias.lagoon.amazeeio.cloud/aliases.drushrc.php.stub');
  curl_setopt($ch, CURLOPT_FOLLOWLOCATION, TRUE);
  $aliases_stub = curl_exec($ch);
  curl_close($ch);
}
eval($aliases_stub);
```

Then we register the new file to be scaffolded by composer during install by
adding it to the `file-mapping` dictionary.

```typescript
$$.file('composer.json', (json) => ({
  ...json,
  extra: {
    ...json.extra,
    'drupal-scaffold': {
      ...json.extra['drupal-scaffold'],
      'file-mapping': {
        ...(json.extra['drupal-scaffold']['file-mapping'] || {}),
        '[project-root]/drush/lagoon.aliases.drushrc.php':
          'scaffold/lagoon.aliases.drushrc.php',
      },
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

```typescript
$$.vars({
  projectName,
});
```

```yaml
# |-> docker-compose.yml
version: '2.3'

x-lagoon-project:
  # Lagoon project name (leave `&lagoon-project` when you edit this)
  &lagoon-project { { projectName } }

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
        name: Run any Drupal update hooks
        command: drush -y updb
        service: cli
    - run:
        name: Import configuration changes
        command: drush -y cim
        service: cli
    - run:
        name: Clear caches
        command: drush -y cr
        service: cli
    - run:
        name: Initiate Drush aliases
        command: |
          drush site:alias-convert /app/drush/sites --yes
          mv /app/drush/sites/*.yml ./drush/sites/
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
FROM amazeeio/php:7.4-cli-drupal as builder

RUN apk add --no-cache git && \
  docker-php-ext-install intl && \
  docker-php-ext-enable intl
  docker-php-ext-enable intl && \
  composer selfupdate --2

WORKDIR /app/apps/cms
RUN composer install
RUN composer config --global github-protocols https
RUN composer install --prefer-dist
RUN apk add --no-cache imagemagick
RUN chmod +r ~/.composer/auth.json ~/.composer/config.json

ENV WEBROOT=apps/cms/web
```

```dockerfile
# |-> .lagoon/php.Dockerfile
ARG CLI_IMAGE
FROM ${CLI_IMAGE} as cli

FROM amazeeio/php:7.4-fpm
RUN apk add --no-cache imagemagick git

COPY --from=cli /app/apps/cms /app/apps/cms
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

It also depends on the latest version of `alchemy/zippy`, which is not a stable
release. The preferred stability is "stable", and we don't want to change that,
so we have to explicitly install the `dev` version of `alchemy/zippy`.

```typescript
$$('composer require alchemy/zippy:dev-master');
```

Now we can install `amazeelabs/silverback-cli` and everything it entails.

```typescript
$$('composer require amazeelabs/silverback-cli --with-all-dependencies');
```

If you have [direnv] installed, you should be able to run `direnv allow` and
afterwards `silverback setup --profile standard` to install vanilla Drupal. Due
to that dependency and also to integrate better with the Javascript development
process, we make the `cms` app a yarn package too.

```typescript
$$('yarn init -p -y');
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/cms`,
  description: `Content management system for ${projectName.toUpperCase()}`,
}));
```

Now we can add some scripts to conveniently access common Drupal command line
tasks.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    prepare:
      'if php -v && [[ -z $LAGOON ]]; then composer install && yarn setup; fi',
    'drupal-install': 'source .envrc && silverback setup --profile standard',
    setup: 'source .envrc && silverback setup',
    start: 'source .envrc && cd web && php -S 127.0.0.1:8888 .ht.router.php',
    drush: 'source .envrc && drush',
    silverback: 'source .envrc && silverback',
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

Over time the Drupal config will accumulate more and more changes, and
`yarn setup` will take longer again. Then you can run `yarn install` again to
create and updated version of `install-cache.zip` and commit it.

`yarn start` will start a local PHP development server, hosting the content
management system.

[direnv]: https://direnv.net/

## Finishing up

That's it. Now just commit all the changes.

```typescript
$$.chdir('../../');
$$('git add apps/cms docker-compose.yml .lagoon.yml .lagoon');
$$('git commit -m "chore: lagoon setup"');
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
