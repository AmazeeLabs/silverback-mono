#!/bin/bash
set -e

if [ -z "$1" ]
  then
    >&2 echo 'Pass command to execute from silverback-drupal app environment.'
    exit 1
fi

cd ../../../../../../apps/silverback-drupal
source .envrc

$1
