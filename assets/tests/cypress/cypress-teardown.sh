#!/usr/bin/env bash
if [ -d ./cypress/.backup ]; then
  rm -rf ./web/sites/default/files
  cp -R ./cypress/.backup ./web/sites/default/files
  rm -rf ./cypress/.backup
fi
