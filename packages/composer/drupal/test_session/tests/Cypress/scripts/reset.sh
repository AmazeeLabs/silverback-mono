#!/bin/bash
set -e

cd ../../../../../../apps/silverback-drupal

./vendor/bin/silverback snapshot-restore cypress
