#!/usr/bin/env bash
rm -rf test
echo "test" | node ./dist/index.js create-monorepo
cd test || exit 1
node ../dist/index.js add-drupal
node ../dist/index.js add-gatsby


cd .. || exit
rm -rf test
