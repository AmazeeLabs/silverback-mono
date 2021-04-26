#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const forks = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'forks.json')).toString());
const tmpDir = path.resolve(__dirname, '.forks-tmp');

if (fs.existsSync(tmpDir)) {
  execSync(`rm -rf ${tmpDir}`);
}

fs.mkdirSync(tmpDir);

process.chdir(tmpDir);

forks.map(fork => {
  const dir = new URL(fork.repository).pathname.substr(1);
  execSync(`mkdir -p AmazeeLabs`);
  execSync(`mkdir -p tmp/AmazeeLabs`);
  execSync(`git clone ${fork.repository} tmp/${dir}`);
  execSync(`cp -R ../${fork.path} ${dir}`);
  execSync(`rm -rf ${dir}/.git`);
  execSync(`cp -R tmp/${dir}/.git ${dir}/.git`)
  process.chdir(path.resolve(tmpDir, dir));
  const result = execSync(`git status --porcelain`).toString();
  console.log(result);
  if (result.trim().length > 0) {
    execSync(`git add -f *`);
    fs.readdirSync(path.resolve(tmpDir, dir)).map(file => {
      if (file.substr(0, 1) === '.') {
        execSync(`git add -f ${file}`);
      }
    })
    execSync(`git commit -m "chore: updated fork"`);
    execSync(`git push`);
  }
  process.chdir(tmpDir);
});
