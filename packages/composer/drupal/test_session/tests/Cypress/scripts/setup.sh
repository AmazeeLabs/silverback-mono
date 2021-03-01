#!/bin/bash
set -e

cd ../../../../../../apps/silverback-drupal
composer install
source .envrc

silverback setup
silverback snapshot-create cypress -y
