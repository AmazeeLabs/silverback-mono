#!/usr/bin/env bash
rm -rf test
echo "test" | node ./dist/index.js create-monorepo
