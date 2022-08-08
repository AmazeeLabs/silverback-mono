# GraphQL persisted queries for Silverback

This is a basic persisted-queries plugin for GraphQL Drupal module.

## Setup

1. Configure the frontend to generate the query map. See [@amazeelabs/silverback-graphql-persisted](https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/npm/%40amazeelabs/silverback-graphql-persisted#readme) package.
1. Install this module.
   ```
   composer require amazeelabs/silverback_graphql_persisted
   drush en silverback_graphql_persisted
   ```
1. Enable `Silverback Persisted Query` plugin at `/admin/config/graphql/servers/manage/{my-server}/persisted_queries`.
1. Add the query map path to `setting.php`. It should be relative to `DRUPAL_ROOT`. Example:
   ```php
   $settings['silverback_graphql_persisted_map'] = '../generated/persisted-queries-map.json';
   ```
1. Adjust `execute {my-server} arbitrary graphql requests` and `execute {my-server} persisted graphql requests` user permissions.
