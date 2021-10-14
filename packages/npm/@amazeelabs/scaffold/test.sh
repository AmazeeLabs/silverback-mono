#!/usr/bin/env bash

set -e

# Clean up any leftover test directory from previous failed runs.
rm -rf test

# Create the test directory and change there.
mkdir test
cd test || exit 1

# Initiate a git repository.
git init
echo "node_modules" >> .gitignore

# Initiate a new node package.
yarn init -y

# Run the initial scaffold to install dotfiles and scripts.
../cli.js

# Execute a first install.
yarn

# Create one typescript file so tsc has something to check.
mkdir src
echo "console.log('test');" > src/index.ts;

# Commit the initial package
git add package.json yarn.lock .gitignore tsconfig.json src .eslintrc.js .lintstagedrc .prettierrc jest.config.js .gitignore
git commit -m "initial commit"

if [[ -n "$(git status --porcelain)" ]]; then
  >&2 echo "Git repository not clean."
  exit 1
fi

# Run the (empty) test suite. This is a proof that the tools are there.
yarn test:static
yarn test:unit
yarn test:integration
