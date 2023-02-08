#!/usr/bin/env bash

echo "Initializing build";
sleep 1
echo "Build step 1/5";
sleep 1
echo "Build step 2/5";
sleep 1
echo "Build step 3/5";
echo "This is going to fail on purpose. We want to test the error handling.";
exit 1
sleep 1
echo "Build step 4/5";
sleep 1
echo "Build step 5/5";

DIR=$(dirname "$0");
BUILD_DIR="$DIR/public"

if [ -d "$BUILD_DIR" ]; then
  count=$(cat "$BUILD_DIR/count.txt")
  newcount=$((count + 1))
  echo "${newcount}" > "$BUILD_DIR/count.txt"
  echo "<html><head></head><body><h1>Build Nr.: ${newcount}</h1></body></html>" > "$BUILD_DIR/index.html"
  echo "Build finished"
else
  echo "Build directory does not exist"
  exit 1;
fi
