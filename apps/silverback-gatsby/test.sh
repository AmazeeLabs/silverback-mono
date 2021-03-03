#!/bin/bash

set -e

function finish {
  echo "👇 Cleaning up..."
  kill $( lsof -i:8888 -t ) || true
  kill $( lsof -i:8000 -t ) || true
  kill $( lsof -i:9000 -t ) || true
  kill $( lsof -i:9001 -t ) || true
  echo "👉 Cleanup done."
}
trap finish EXIT

function setup_drupal {
  echo "👇 Setting up Drupal..."
  cd ../silverback-drupal
  source .envrc

  composer install
  vendor/bin/silverback teardown
  vendor/bin/silverback setup
  vendor/bin/drush -y content-sync:import

  drush serve -q :8888 &
  DRUSH_SERVE_WAIT=0
  until nc -z 127.0.0.1 8888 || ((DRUSH_SERVE_WAIT > 19)); do sleep 1; done
  echo "👉 Drupal is ready."
}
# Run in a subshell to not spoil a lot with Drupal env vars.
( setup_drupal )

unset PREFIX # Some NVM conflict.
source .envrc

echo "👇 Setting up Gatsby Preview..."
yarn clean
yarn develop &
sleep 10
echo "👉 Gatsby Preview ready."

echo "👇 Testing Gatsby Preview..."
yarn cypress run --spec cypress/integration/gatsby-preview.ts
# Need to kill it before running `gatsby serve` because both `gatsby develop`
# and `gatsby serve` use the same .cache directory.
kill $( lsof -i:8000 -t )
echo "👉 Tested Gatsby Preview."

echo "👇 Setting up Gatsby Site..."
yarn clean
yarn fast-builds:serve:local &
sleep 20
YARN_SERVE_WAIT=0
until nc -z 127.0.0.1 9001 || ((YARN_SERVE_WAIT > 19)); do sleep 1; done
echo "👉 Gatsby Site ready."

echo "👇 Testing Gatsby Site..."
yarn cypress run --spec cypress/integration/build-status.ts
yarn cypress run --spec cypress/integration/gatsby-site.ts
echo "👉 Tested Gatsby Site."

