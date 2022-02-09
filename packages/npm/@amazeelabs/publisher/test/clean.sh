#!/usr/bin/env bash

echo "Cleaning caches and artifacts"
sleep 1
echo "Cleaning step 1/3"
sleep 1
echo "Cleaning step 2/3"
sleep 1
echo "Cleaning step 3/3"

DIR=$(dirname "$0");
BUILD_DIR="$DIR/public"

rm -rf "$BUILD_DIR"

echo "Cleaning done"
