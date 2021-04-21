# Create a monorepo project

## Requirements

Yarn workspaces and lerna require `git` _2_, `node` _v12_ and `yarn` _1.0_ at
the least. Make sure you installed them on your machine.

```typescript
$('git --version', {
  stdout: $.minimalVersion('2'),
});

// Check node version.
$('node -v', {
  stdout: $.minimalVersion('12'),
});

// Check yarn version.
$('yarn -v', {
  stdout: $.minimalVersion('1.0'),
});
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
$(`mkdir ${name}`);

// Change into that directory.
$.chdir(name);
```

Initiate a new yarn workspace project and set the author field.

```typescript
// Initiate the yarn project.
$('yarn init -w -y');

// Add the author to package.json.
$.updateJsonFile('package.json', (json) => ({
  ...json,
  author: 'Amazee Labs <development@amazeelabs.com>',
}));
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
$('yarn add commitizen');
$('yarn add @commitlint/cli');
$('yarn add @commitlint/config-conventional');
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
```

This allows us to use the [commitizen] CLI to write proper commit messages, but
they are not enforced automatically. That's the job of [husky]. Add the
dependency a `postinstall` to that will take care of installing the git hooks
whenever the project is cloned and installed for the first time.

```typescript
$('yarn add husky');
$.updateJsonFile('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    postinstall: 'husky install',
  },
}));
```

Initiate the git repository and tell husky to check every commit message against
the [conventional commit] standards. This also requires a `.husky` directory at
the project root, as well as `postinstall` to be run afterwards, so the hooks
are installed initially. By convention, the main development branch in
silverback projects should be named `dev`:

```typescript
$('git init -b dev');
$('mkdir .husky');
$(`yarn husky add .husky/commit-msg 'yarn commitlint --edit "$1"'`);
$(`yarn postinstall`);
```

We do not want the `node_modules` directory in the git repository, so we create
a `.gitignore` file to ignore it.

```ignore
# |-> .gitignore
node_modules
```

Now initiate the git repository and stage all the changes for our first commit:

```typescript
$(`git add .gitignore package.json yarn.lock .husky`);
```

Committing with an invalid message should fail now:

```typescript
$(`git commit -m "fixes!!!"`, {
  code: 1,
});
```

## Lerna

    TODO

## Prettier

    TODO

## Readme file

Let's add a readme file, so whenever somebody stumbles on our new project, they
are directed to this documentation right away.

```typescript
$.vars({
  projectName: name.toUpperCase(),
});
```

```markdown
<!-- |-> README.md -->

# {{projectName}}

This project was created with [amazee-recipes].

[amazee-recipes]: https://www.npmjs.com/package/@amazeelabs/recipes
```

Don't forget to add the new `README.md` to the repository.

```typescript
$(`git add README.md`);
```

## Commit everything

Husky should allow us to use a proper commit message, so we can conclude our
first commit in the new monorepo:

```typescript
$(`git commit -m "chore: setup monorepo and commit conventions"`);
```

At this point we should be on the `dev` branch, and the working directory should
be clean.

```typescript
$('git branch', {
  stdout: /^\* dev$/m,
});
$('git status --porcelain', {
  stdout: (output) =>
    output.trim().length !== 0
      ? `uncommitted changes:\n${output}\n`
      : undefined,
});
```
