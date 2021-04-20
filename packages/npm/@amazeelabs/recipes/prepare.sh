#!/usr/bin/env bash

cd recipes || exit
../lit.sh

for file in *.ts; do
  cat ../prepend.txt "$file" >> "$file.tmp"
  rm "$file"
  mv "$file.tmp" "$file"
done

tsc
