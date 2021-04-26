#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const tmpDir = path.resolve(__dirname, '.forks-tmp');

// Make sure there is an empty temp directory for managing forks.
if (fs.existsSync(tmpDir)) {
  execSync(`rm -rf ${tmpDir}`);
}
fs.mkdirSync(tmpDir);

process.chdir(tmpDir);

// Read forks information from `forks.json`.
const forks = JSON.parse(fs.readFileSync(path.resolve(__dirname, 'forks.json')).toString());

forks.map(fork => {
  const dir = new URL(fork.repository).pathname.substr(1);
  execSync(`mkdir -p AmazeeLabs`);
  execSync(`mkdir -p tmp/AmazeeLabs`);
  // Clone the fork to get it's .git directory.
  execSync(`git clone ${fork.repository} tmp/${dir}`);
  // Copy the patched version of the target package.
  execSync(`cp -R ../${fork.path} ${dir}`);
  // Remove the original .git directory and replace it with the one from the
  // fork.
  execSync(`rm -rf ${dir}/.git`);
  // Apply the git history of the fork to the patched package.
  execSync(`cp -R tmp/${dir}/.git ${dir}/.git`)

  process.chdir(path.resolve(tmpDir, dir));
  // Bail out if the directory does not contain a composer package.
  if (!fs.existsSync('composer.json')) {
    console.warn(`${fork.path} is not a composer package`);
    return;
  }

  // Change the composer package name.
  const composerJson = JSON.parse(fs.readFileSync('composer.json').toString());
  composerJson.name = dir.toLocaleLowerCase();
  fs.writeFileSync('composer.json', JSON.stringify(composerJson, null, 2));

  // Check if there are changes, else we don't have to commit anything.
  const result = execSync(`git status --porcelain`).toString();
  console.log(result);

  if (result.trim().length > 0) {
    // Stage all changes.
    execSync(`git add -f *`);
    fs.readdirSync(path.resolve(tmpDir, dir)).map(file => {
      if (file.substr(0, 1) === '.') {
        execSync(`git add -f ${file}`);
      }
    })

    // Commit and push to the target repository.
    execSync(`git commit -m "chore: updated fork"`);
    execSync(`git push`);
  }
  process.chdir(tmpDir);
});
