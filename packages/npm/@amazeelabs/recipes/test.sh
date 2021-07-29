#!/usr/bin/env bash

set -e

yarn config set script-shell /bin/bash

rm -rf test
echo "test" | node ./dist/index.js create-monorepo
cd test || exit 1

git add README.md
git commit -m "chore: executed 'create-monorepo' recipe"
node ../dist/index.js add-gatsby
git add README.md
git commit -m "chore: executed 'add-gatsby' recipe"
node ../dist/index.js add-drupal
git add README.md
git commit -m "chore: executed 'add-drupal' recipe"
node ../dist/index.js add-storybook
git add README.md
git commit -m "chore: executed 'add-storybook' recipe"


cd .. || exit
rm -rf test
