#!/usr/bin/env bash
set -e
cd ../../../../apps/silverback-drupal || exit 1
vendor/phpunit/phpunit/phpunit web/modules/contrib/silverback_gutenberg
