#!/usr/bin/env bash

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

# Install the scaffold package.
yarn add ../

# Run the initial scaffold to install dotfiles and scripts.
yarn amazee-scaffold
yarn husky install && rm -rf .husky

# Commit the initial package
git add package.json yarn.lock .gitignore
git commit -m "initial commit"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "Git repository not clean."
  exit 1
fi

# Run the (empty) test suite. This is a proof that the tools are there.
yarn test

# Clean the git repository to simulate a fresh checkout.
git clean -xdf

if [ -f jest.config.js ]; then
  echo "Git repository not properly cleaned up."
  exit 1
fi

# Run yarn install which should re-scaffold files.
yarn

if [[ ! -f "jest.config.js" ]]; then
  echo "jest.config.js was not scaffolded"
  exit 1
fi

# Run the (empty) test suite. This is a proof that the tools are there.
yarn test
