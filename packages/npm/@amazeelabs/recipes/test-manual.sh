#!/usr/bin/env bash
set -ex

rm -rf /tmp/recipes_test
pnpm build

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )
cd /tmp

echo 'recipes_test' | LOG=silly node "$DIR/dist/index.js" create-monorepo

cd recipes_test
LOG=silly node "$DIR/dist/index.js" add-gatsby
LOG=silly node "$DIR/dist/index.js" add-drupal
LOG=silly node "$DIR/dist/index.js" add-storybook
cd packages/@recipes_test/ui
echo 'TestOrganism' | LOG=silly node "$DIR/dist/index.js" new-organism
echo 'TestMolecule' | LOG=silly node "$DIR/dist/index.js" new-molecule
echo 'TestLayout' | LOG=silly node "$DIR/dist/index.js" new-layout
echo 'TestAtom' | LOG=silly node "$DIR/dist/index.js" new-atom
cd /tmp/recipes_test/

pnpm install

pnpm test:static:all
pnpm test:unit:all
pnpm test:integration:all

docker-compose up --detach --build
docker-compose down -v --rmi all --remove-orphans
