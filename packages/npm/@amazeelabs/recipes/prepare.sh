#!/usr/bin/env bash

echo "Clearing dist directory"
rm -rf dist

echo "Clearing tmp directory"
rm -rf tmp

echo "Removing transpiled recipes"
rm -rf recipes/*.ts

echo "Compiling helpers"
tsc -p tsconfig.pre.json

cp -R recipes tmp

cd tmp || exit

echo "Preprocessing recipes"
for file in *.ts.md; do
  node ../dist/preprocess.js "$file"
done

echo "Stripping docs from recipes"
../lit.sh

echo "Prepending $ import"
for file in *.ts; do
  cat ../prepend.txt "$file" >> "$file.tmp"
  rm "$file"
  cp "$file.tmp" "$file"
done

cp -R *.ts ../recipes/

cd .. || exit

rm -rf tmp

echo "Compiling recipes"
tsc
