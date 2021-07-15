#!/usr/bin/env bash
set -e
cd ../../../../apps/silverback-drupal || exit 1
source .envrc
composer install
vendor/bin/silverback setup
vendor/phpunit/phpunit/phpunit web/modules/contrib/silverback_gutenberg
