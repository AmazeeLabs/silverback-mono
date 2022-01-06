#!/usr/bin/env bash
set -ex

rm -rf test
yarn prepare

echo 'test' | LOG=silly node ./dist/index.js create-monorepo

cd test
LOG=silly node ../dist/index.js add-gatsby
LOG=silly node ../dist/index.js add-drupal
LOG=silly node ../dist/index.js add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose build
docker-compose rm -fsv
