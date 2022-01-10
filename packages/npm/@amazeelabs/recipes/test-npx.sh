#!/usr/bin/env bash
set -ex

rm -rf test
yarn prepare

echo 'test' | LOG=silly npx @amazeelabs/recipes create-monorepo

cd test
LOG=silly npx @amazeelabs/recipes add-gatsby
LOG=silly npx @amazeelabs/recipes add-drupal
LOG=silly npx @amazeelabs/recipes add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose build
docker-compose rm -fsv
