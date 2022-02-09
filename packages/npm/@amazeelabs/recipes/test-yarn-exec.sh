#!/usr/bin/env bash
set -ex

rm -rf /tmp/recipes_test
yarn global add @amazeelabs/recipes

cd /tmp

echo 'recipes_test' | LOG=silly yarn exec amazee-recipes create-monorepo

cd recipes_test
LOG=silly yarn exec amazee-recipes add-gatsby
LOG=silly yarn exec amazee-recipes add-drupal
LOG=silly yarn exec amazee-recipes add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose up --detach --build
docker-compose down -v --rmi all --remove-orphans
