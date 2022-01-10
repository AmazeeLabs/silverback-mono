#!/usr/bin/env bash
set -ex

rm -rf test
yarn prepare

yarn global add @amazeelabs/recipes

echo 'test' | LOG=silly yarn exec amazee-recipes create-monorepo

cd test
LOG=silly yarn exec amazee-recipes add-gatsby
LOG=silly yarn exec amazee-recipes add-drupal
LOG=silly yarn exec amazee-recipes add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all

docker-compose build
docker-compose rm -fsv
