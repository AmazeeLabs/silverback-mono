#!/bin/bash
set -e

if [ -z "$1" ]
  then
    >&2 echo 'Pass "true" or "false" to enable or disable the test_session module functions.'
    exit 1
fi

cd ../../../../../../apps/silverback-drupal
source .envrc

pkill -f ":8888" || true
TEST_SESSION_ENABLED="$1" drush serve > /dev/null 2>&1 &

DRUSH_SERVE_WAIT=0
until nc -z 127.0.0.1 8888 > /dev/null || ((DRUSH_SERVE_WAIT > 10)); do sleep 0.1; done
