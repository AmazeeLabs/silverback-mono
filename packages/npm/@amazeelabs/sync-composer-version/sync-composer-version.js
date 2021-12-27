#!/usr/bin/env node

const { outputJSONSync, readJSONSync } = require("fs-extra");

const composer = readJSONSync("composer.json");
const npm = readJSONSync("package.json");
composer.version = npm.version;
outputJSONSync("composer.json", composer, { spaces: 2 });
