#!/usr/bin/env bash
set -ex

rm -rf /tmp/recipes_test
npm install -g @amazeelabs/recipes

cd /tmp

echo 'recipes_test' | LOG=silly amazee-recipes create-monorepo

cd recipes_test
LOG=silly amazee-recipes add-gatsby
LOG=silly amazee-recipes add-drupal
LOG=silly amazee-recipes add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose up --detach --build
docker-compose down -v --rmi all --remove-orphans
