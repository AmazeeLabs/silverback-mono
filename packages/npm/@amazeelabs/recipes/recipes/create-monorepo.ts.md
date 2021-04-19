# Create a monorepo project

## Requirements

Yarn workspaces and lerna require `git` _2_, `node` _v12_ and `yarn` _1.0_ at
the least. Make sure you installed them on your machine.

```typescript
import fs from 'fs';
import $ from '../helpers';
```

```typescript
$.run('git --version', {
  stdout: $.minimalVersion('2'),
});
$.log.info('verified git version');

// Check node version.
$.run('node -v', {
  stdout: $.minimalVersion('12'),
});
$.log.info('verified node version');

// Check yarn version.
$.run('yarn -v', {
  stdout: $.minimalVersion('1.0'),
});
$.log.info('verified yarn version');
```

## Basic project setup

Choose a project name that starts with a letter and contain lower case letters,
numbers and underscores only. Then use it to create a project directory and jump
into it for all further steps.

```typescript
// Choose a project name.
const { name } = $.prompts({
  type: 'text',
  name: 'name',
  message: 'Choose a project name:',
  validate: (name) =>
    !/^[a-z][a-z\d_]+$/.test(name)
      ? 'Project names must start with a letter and contain lower case letters, numbers and underscores only.'
      : true,
});

// Create the directory.
fs.mkdirSync(name);

// Change into that directory.
process.chdir(name);
$.log.info(`created project directory "${name}"`);
```

Initiate a new yarn workspace project and set the author field.

```typescript
// Initiate the yarn project.
$.run('yarn init -w -y');

// Add the author to package.json.
$.updateJsonFile('package.json', (json) => ({
  ...json,
  author: 'Amazee Labs <development@amazeelabs.com>',
}));
$.log.info(`initiated yarn project`);
```

## Commit conventions

We use the [conventional commits] standard for commit messages and [husky] in
tandem with [commitizen] to enforce them. We use the current "Epic" as the
scope. The Jira issue can be added under `Refs`, although if pull requests are
named correctly, this is not strictly needed. The relation between commits and
issues can already be traced.

It is a good practice to reference other colleagues involved in commits, even if
they did not contribute code (product managers, designers), so we are better
able to find out who took decisions and follow up on them.

    feat(shop): display variants on product page

    Variants are displayed on the product page, along with their
    "add-to-cart" buttons.

    Refs: #SHOP-1234
    Co-authored-by: Leksat <alex@amazeelabs.com>
    Co-authored-by: Zsofiag <zsofia@amazeelabs.com>

[conventional commits]: https://www.conventionalcommits.org/en/v1.0.0/
[husky]: https://www.npmjs.com/package/husky
[commitizen]: https://www.npmjs.com/package/commitizen

First, install the suite of [commitizen] packages:

```typescript
$.run('yarn add -D commitizen');
$.run('yarn add -D @commitlint/cli');
$.run('yarn add -D @commitlint/config-conventional');
$.log.info(`installed commitizen packages`);
```

Add `commitlint` configuration to `package.json`. [commitizen] will pick it up
from there. You can also add a `yarn commit` script which will trigger the
[commitizen] cli that can guide you through the commit process.

```typescript
$.updateJsonFile('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    commit: 'git-cz',
  },
  commitlint: {
    extends: ['@commitlint/config-conventional'],
  },
}));
$.log.info(`updated package.json with commitizen configuration`);
```

This allows us to use the [commitizen] CLI to write proper commit messages, but
they are not enforced automatically. That's the job of [husky]. Add the
dependency a `postinstall` to that will take care of installing the git hooks
whenever the project is cloned and installed for the first time.

```typescript
$.run('yarn add husky');
$.updateJsonFile('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    postinstall: 'husky install',
  },
}));
$.log.info(`installed husky and the husky postinstall hook`);
```

Initiate the git repository and tell husky to check every commit message against
the [conventional commit] standards. This also requires a `.husky` directory at
the project root, as well as `postinstall` to be run afterwards, so the hooks
are installed initially.

```typescript
$.run('git init');
fs.mkdirSync('.husky');
$.run(`yarn husky add .husky/commit-msg 'yarn commitlint --edit "$1"'`);
$.run(`yarn postinstall`);
$.log.info(`initiated git repository and commit-msg hook`);
```

We do not want the `node_modules` directory in the git repository, so we create
a `.gitignore` file to ignore it.

```typescript
fs.writeFileSync('.gitignore', 'node_modules');
$.log.info(`added .gitignore`);
```

Now initiate the git repository and stage all the changes for our first commit:

```typescript
$.run(`git add .gitignore package.json yarn.lock .husky`);
$.log.info(`staged changes to git`);
```

Committing with an invalid message should fail now:

```typescript
$.run(`git commit -m "fixes!!!"`, {
  code: 1,
});
```

A proper commit message should work though, and that concludes our first commit
in the new monorepo:

```typescript
$.run(`git commit -m "chore: setup monorepo and commit conventions"`);
$.log.info(`commited monorepo setup`);
```

Now that we have a git branch, we can already make sure it is named properly. By
convention, the main development branch in silverback projects should be named
`dev`:

```typescript
$.run(`git branch -m master dev`);
$.log.info(`renamed "master" branch to "dev"`);
```

At this point we should be on the `dev` branch, and the working directory should
be clean.

```typescript
$.run('git branch', {
  stdout: /^\* dev$/m,
});
$.run('git status --porcelain', {
  stdout: (output) =>
    output.trim().length !== 0
      ? `uncommitted changes:\n${output}\n`
      : undefined,
});
```
