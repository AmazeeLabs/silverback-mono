#!/usr/bin/env bash
rm -rf test
echo "test" | node ./dist/index.js create-monorepo
cd test || exit 1


cd .. || exit
rm -rf test
