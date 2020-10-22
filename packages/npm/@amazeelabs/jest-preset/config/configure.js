#!/usr/bin/env node

const path = require('path');
const fs = require('fs');
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question(`Please make sure you ran this command from your project root!
This command will add/adjust files in your project root. Please use VCS to track changes.
Ready? (y/n): `, function (answer) {
  if (answer.trim() === 'y') {
    tasks.copyFiles();
    tasks.adjustFiles();
    console.log('Done! Please check the changes.');
  } else {
    console.log('See you next time.');
  }
  rl.close();
});

const data = {
  paths: {
    projectRoot: process.env.PWD,
    files: path.join(__dirname, 'files'),
  },
  kind: process.argv[2], // e.g. "react"
};

const tasks = {
  copyFiles: () => {
    for (const file of fs.readdirSync(data.paths.files)) {
      const scr = path.join(data.paths.files, file);
      const dest = path.join(data.paths.projectRoot, file);
      fs.copyFileSync(scr, dest);
      if (data.kind) {
        utils.adjustKind(dest);
      }
    }
  },

  adjustFiles: () => {
    utils.adjustPackageJson(path.join(data.paths.projectRoot, 'package.json'));
  },
};

const utils = {
  adjustPackageJson: (filepath) => {
    const contents = fs.readFileSync(filepath, 'utf8');
    const json = JSON.parse(contents);
    if (!json.scripts) {
      json.scripts = {};
    }
    json.scripts['test:ci'] = 'jest';
    json.scripts['test:watch'] = 'jest --watch';
    json.scripts['test'] = 'is-ci test:ci test:watch';
    fs.writeFileSync(filepath, JSON.stringify(json, null, 2));
  },

  adjustKind: (filepath) => {
    const contents = fs.readFileSync(filepath, 'utf8');
    const updated = contents.replace(
      '@amazeelabs/jest-preset',
      '@amazeelabs/jest-preset-' + data.kind
    ).replace(
      '@amazeelabs/eslint-config',
      '@amazeelabs/eslint-config-' + data.kind
    );
    fs.writeFileSync(filepath, updated);
  }
};
