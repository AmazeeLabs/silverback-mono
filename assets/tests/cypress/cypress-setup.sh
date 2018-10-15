#!/usr/bin/env bash

HASH=$(shasum ./config/sync/* | shasum | awk '{print $1;}')

if [ -d ./web/sites/default/files ]; then
  mv ./web/sites/default/files ./cypress/.backup
  rm -rf ./web/sites/default/files
fi

if [ ! -d ./cypress/.cache ]; then
  mkdir ./cypress/.cache
fi

if [ -d "./cypress/.cache/$HASH" ]; then
  cp -R "./cypress/.cache/$HASH" ./web/sites/default/files
else
  ./install.sh
  cp -R ./web/sites/default/files "./cypress/.cache/$HASH"
fi
