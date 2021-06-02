#!/bin/bash

set -ex

if php -v && [[ -z $LAGOON ]]
then
  composer install
  yarn setup
fi
