#!/usr/bin/env bash
set -ex

rm -rf test
yarn prepare
echo 'test' | LOG=silly node ./dist/index.js create-monorepo

cd test
LOG=silly node ../dist/index.js add-gatsby
LOG=silly node ../dist/index.js add-drupal
# TODO: Uncomment once `npx sb init` works again.
#  I tried different solutions from
#  https://stackoverflow.com/questions/63429304/npm-err-cb-apply-is-not-a-function
#  but none worked. It was still failing on both Mac (with nvm) and GitHub CI
#  (Ubuntu).
#LOG=silly node ../dist/index.js add-storybook

yarn install

yarn test:static:all
yarn test:unit:all
yarn test:integration:all


# AXXX add
# docker-compose build
# docker-compose rm -fsv
