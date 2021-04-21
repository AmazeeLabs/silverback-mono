#!/usr/bin/env bash

# Make a copy of "recipes" since we are going to edit them in place.
cp -r recipes tmp

# Compile the helpers
tsc

# Switch into the recipes directory and preprocess all *.ts.md files.
cd recipes || exit

for file in *.ts.md; do
  # Prepend the helpers import and extract scaffolded file blocks.
  node ../dist/preprocess.js "$file"
done

# Strip markdown.
../lit.sh

cd .. || exit

# Compile again to compile the recipes
tsc

# Remove the modified recipes and restore the backup.
rm -rf recipes
mv tmp recipes
