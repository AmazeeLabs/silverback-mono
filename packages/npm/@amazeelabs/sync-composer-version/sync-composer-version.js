#!/usr/bin/env node

const { outputJSONSync, readJSONSync } = require("fs-extra");
const { execSync } = require("child_process");

const composer = readJSONSync("composer.json");
const npm = readJSONSync("package.json");
composer.version = npm.version;
outputJSONSync("composer.json", composer, { spaces: 2 });

execSync("git add .");
