#!/usr/bin/env bash
set -ex

rm -rf test
npm install -g @amazeelabs/recipes

echo 'test' | LOG=silly amazee-recipes create-monorepo

cd test
LOG=silly amazee-recipes add-gatsby
LOG=silly amazee-recipes add-drupal
LOG=silly amazee-recipes add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose build
docker-compose rm -fsv
