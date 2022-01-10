# Create a monorepo project

## Requirements

Yarn workspaces and lerna require `git` _2_, `node` _v12_ and `yarn` _1.0_ at
the least. Make sure you installed them on your machine.

```typescript
$$('git --version', {
  stdout: $$.minimalVersion('2'),
});

// Check node version.
$$('node -v', {
  stdout: $$.minimalVersion('14'),
});

// Check yarn version.
$$('yarn -v', {
  stdout: $$.minimalVersion('1.0'),
});

// TODO: Should we test for nvm? And maybe for direnv?
```

## Basic project setup

Choose a project name that starts with a letter and contain lower case letters,
numbers and underscores only. Then use it to create a project directory and jump
into it for all further steps.

```typescript
// Choose a project name.
const { projectName } = $$.prompts({
  type: 'text',
  name: 'projectName',
  message: 'Choose a project name:',
  validate: (name) =>
    !/^[a-z][a-z\d_]+$/.test(name)
      ? 'Project names must start with a letter and contain lower case letters, numbers and underscores only.'
      : true,
});

// Create the directory.
$$(`mkdir ${projectName}`);

// Change into that directory.
$$.chdir(projectName);
```

Store Node.js version in `.nvmrc` file and make it autoload when switching into
the project directory. You can change it later.

```typescript
$$('node -v', {
  stdout: (version: string) => {
    $$.vars({ nodeVersion: version.match(/[0-9]+/)![0] });
    return undefined;
  },
});
```

```txt
# |-> .nvmrc

{{nodeVersion}}
```

```bash
# |-> .envrc
#!/usr/bin/env bash

# Set node version defined in .nvmrc.
nvm_sh=~/.nvm/nvm.sh
if [[ -e $nvm_sh ]]; then
  source $nvm_sh
  nvm use || nvm install
fi
```

Initiate a new yarn workspace project and set the author field.

```typescript
// Initiate the yarn project.
$$('yarn init -w -y');

// Add the author to package.json.
$$.file('package.json', (json) => ({
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
$$('yarn add commitizen');
$$('yarn add @commitlint/cli');
$$('yarn add @commitlint/config-conventional');
```

Add `commitlint` configuration to `package.json`. [commitizen] will pick it up
from there. You can also add a `yarn commit` script which will trigger the
[commitizen] cli that can guide you through the commit process.

```typescript
$$.file('package.json', (json) => ({
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
$$('yarn add husky');
$$.file('package.json', (json) => ({
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
$$('git init -b dev');
$$('mkdir .husky');
$$(`yarn husky add .husky/commit-msg 'yarn commitlint --edit "$1"'`);
$$(`yarn postinstall`);
```

We do not want the `node_modules` directory in the git repository, so we create
a `.gitignore` file to ignore it.

```ignore
# |-> .gitignore
node_modules
```

Now initiate the git repository and stage all the changes for our first commit:

```typescript
$$(`git add .nvmrc .envrc .gitignore package.json yarn.lock .husky`);
```

Committing with an invalid message should fail now:

```typescript
$$(`git commit -m "fixes!!!"`, {
  code: 1,
});
```

If we behave though, husky will allow us to do our first commit now.

```typescript
$$(`git commit -m "chore: setup monorepo and commit conventions"`);
```

## Lerna

Projects are divided into multiple applications (Gatsby website, Drupal content
management system ...) and packages (React UI libraries, Drupal modules ...). We
use [Lerna] and [Yarn workspaces] to manage these packages automatically. This
helps us specifically to:

1. Optimize package installs, by centralizing common dependencies.
2. Automatic release versions and changelogs based on [conventional commits].
3. Dependency change tracking, to detect which parts of the project changed
   since the last release and optimize test runs.

[lerna]: https://github.com/lerna/lerna
[yarn workspaces]: https://classic.yarnpkg.com/en/docs/workspaces/

First we have to declare our yarn workspaces in `package.json`:

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    postinstall: `lerna run prepare && ${json.scripts.postinstall}`,
  },
  workspaces: ['apps/*', 'packages/*/*'],
  private: true,
}));
```

We have two types of packages. `apps` contains applications that make up the
project, while `packages` is the place for cohesive libraries that can be used
by one or more applications.

[Lerna] works on top of yarn workspaces. We have to install it and place a
config file in the repository root.

```typescript
$$('yarn add -W lerna');
$$.file('lerna.json', () => ({
  version: 'independent',
  npmClient: 'yarn',
  useWorkspaces: true,
  command: {
    publish: {
      conventionalCommits: true,
      message: 'chore(release): release',
    },
  },
}));
```

This configuration tells lerna to use `yarn` and [yarn workspaces], use
[conventional commits] for calculating automatic release versions in
_independent_ mode. The latter means that packages will have their own version
numbers instead of maintaining a single one across the whole project.

```typescript
$$('git add package.json yarn.lock lerna.json');
$$(`git commit -m "chore: configure lerna"`);
```

## Prettier

Prettier is a great tool for not worrying about formatting code. Almost all
editors provide integration to format-as-you-type, and we can also tell husky to
format everything we worked on before it is committed.

First, install the `prettier` package itself as well as our configuration preset
and drop a configuration file into the repository that tells prettier to use it.

```typescript
$$('yarn add -W prettier @amazeelabs/prettier-config');
```

```javascript
// |-> prettier.config.js
module.exports = require('@amazeelabs/prettier-config');
```

Prettier can take care of formatting Javascript, Typescript, JSON, YAML, JSX/TSX
and even Markdown files. Use the respective plugins for
[Webstorm/PHPStorm][prettier-intellij] and [VSCode][prettier-vscode] to
integrate it into your workflow.

[prettier-intellij]: https://www.jetbrains.com/help/phpstorm/prettier.html
[prettier-vscode]:
  https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode

To test the installation works, we create a simple Javascript file with a single
line. When then running prettier on it, it should a semicolon, add a trailing
newline and change the double to single quotes.

```typescript
$$.file('test.js', () => ['"foobar"']);
```

```typescript
$$('yarn prettier -w test.js');
$$('cat test.js', {
  stdout: /'foobar';/,
});
```

Let's remove the test file again.

```typescript
$$('rm test.js');
```

We also want to make sure everything that is committed is already formatted
properly, so _Smartass McNitpicky_ (fictional team-member) doesn't waste time in
code reviews complaining about the correct use of whitespaces or semicolons.
Processing _all_ files for every commit could be a little annoying, so we use
[lint-staged] in combination with [husky] to only re-format the files we
actually touched. At this point we need to make sure that the automated process
does not commit uncontrolled to sub-packages and trigger new releases by
accident.

```typescript
$$('yarn add -W lint-staged');
```

```javascript
// |-> lint-staged.config.js
const micromatch = require('micromatch');

module.exports = (allStagedFiles) => {
  const files = micromatch(allStagedFiles, ['!packages/**', '!apps/**']);
  return [`prettier -w ${files.join(' ')}`];
};
```

Order husky to prettify every staged file before committing.

```typescript
$$(`yarn husky add .husky/precommit 'yarn lint-staged'`);
```

As mentioned above, we don't run prettier on packages directly, but leave the
code quality strategy to them. This way packages can bring language specific
tools into the process like unit tests or linters. The only requirement is that
the package defines a `precommit` script in it's `package.json`. Then we can
tell [husky] to use [lerna] to run it on all packages that have changed since
the last release.

```typescript
$$(
  `yarn husky add .husky/precommit 'yarn lerna run precommit --since --exclude-dependents'`,
);
```

[lint-staged]: https://github.com/okonet/lint-staged

```typescript
$$(
  'git add package.json yarn.lock prettier.config.js .husky lint-staged.config.js',
);
$$(`git commit -m "chore: configured prettier with husky"`);
```

## Adding a meta package

Lerna doesn't do much without an actual package to manage. It's a good idea to
keep a _meta_ package with domain specific types, helpers and configuration that
can be shared across the project. Let's add that one.

Create a directory and initiate a new private package with the projects'
namespace.

```typescript
$$(`mkdir -p packages/@${projectName}/meta`);
$$.chdir(`packages/@${projectName}/meta`);
$$('yarn init -y -p');
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/meta`,
  description: `Types and utilities for ${projectName}`,
}));
```

We can run the `@amazeelabs/scaffold` package to inject common tooling like
[jest] , [eslint] and [typescript].

[jest]: https://jestjs.io/
[eslint]: https://eslint.org/
[typescript]: https://www.typescriptlang.org/

```typescript
$$('npx @amazeelabs/scaffold');
```

We now need to re-run `yarn install` on the root level. For Yarn 1 it's a
required action after making changes in the workspaces.

```typescript
$$('cd ../../.. && yarn');
```

Among some others, this registered bespoken `precommit` script to the package
which will run `lint-staged` within the package scope. The configuration for
lint-staged in turn will prettify all staged files and run [jest] tests related
to these. The [jest] runner also includes [eslint]. That means we can make sure
nothing is committed that breaks tests, formatting or coding standards.

Let's run a test on this. Create a simple file with a function that violates
[eslint] rules, like an unused argument.

```typescript
$$('mkdir -p src');
```

```typescript
// |-> src/foo.ts

// TODO: Delete this file when you have actual code in the package.
export const foo = (bar: any) => true;
```

The `precommit` command should fail now.

```typescript
$$('git add src/foo.ts');
$$('yarn precommit', {
  code: 1,
});
```

If we fix that problem, but violate prettier standards instead, the command
succeeds and automatically fixes these. In this case we miss the trailing
semicolon.

```typescript
$$.file('src/foo.ts', () => ['export const foo = () => true']);
```

Now `precommit` should return successfully, and our unholy coding standard
violation has been fixed magically.

```typescript
$$('git add src/foo.ts');
$$('yarn precommit');
$$('cat src/foo.ts', {
  stdout: /export const foo = \(\) => true;/,
});
```

Unit tests have just passed silently, because there are none. Let's create a
failing one to make sure it will also affect our commit check.

```typescript
$$('mkdir -p src/__tests__');
```

```typescript
// |-> src/__tests__/foo.test.ts
import { foo } from '../foo';

test('foo', () => {
  expect(foo()).toBeFalsy();
});
```

Running the `precommit` command now should fail with our intentionally broken
test.

```typescript
$$('git add src/foo.ts');
$$('yarn precommit', {
  code: 1,
  stderr: /src\/__tests__\/foo.test.ts/,
});
```

We fix the test by expecting the return value of `foo` (which is `true`) to be
`truthy` instead of `falsy`.

```typescript
// |-> src/__tests__/foo.test.ts
import { foo } from '../foo';

test('foo', () => {
  expect(foo()).toBeTruthy();
});
```

Now the script should pass 🎉

```typescript
$$('yarn precommit');
```

Also add `.gitignore` (used by `eslint`).

```gitignore
# |-> .gitignore

node_modules
```

We leave the test files as examples for developers, move back to the repository
root and commit the whole package.

```typescript
$$.chdir(`../../..`);
$$('git add packages');
$$(`git commit -m "chore: initiated @${projectName}/meta"`);
```

## Continuous integration

We use [Github Actions] for continuously testing and deploying our project. The
fundamental process consists of two workflows.

### Test workflow

The **Test** workflow runs on every pull request against the `dev` branch, which
always contains the latest version for internal testing. It will install all
dependencies and then run the `test` scripts for all packages that changed since
the last release.

For convenience, we add this test script to the root `package.json` of our
repository. It should not run integration tests in parallel, because when we
bring in Drupal, we have to rely on a single database that would get scrambled
then.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'test:static': 'lerna run test:static --since',
    'test:static:all': 'lerna run test:static',
    'test:unit': 'lerna run test:unit --since',
    'test:unit:all': 'lerna run test:unit',
    'test:integration':
      'lerna run test:integration --since --concurrency=1 --stream',
    'test:integration:all':
      'lerna run test:integration --concurrency=1 --stream',
  },
}));
```

Now we can drop a workflow file that uses this script.

```typescript
$$('mkdir -p .github/workflows');
```

```yaml
# |-> .github/workflows/test.yml
name: Test
on:
  pull_request:
    branches:
      - dev
  push:
    branches:
      - dev
jobs:
  test:
    name: Test
    runs-on: ubuntu-20.04
    steps:
      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          # TODO: Upgrade to PHP 8.
          php-version: '7.4'

      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      - name: Read .nvmrc
        run: |
          echo "##[set-output name=NODE_VERSION;]$(cat .nvmrc| grep -oE '[0-9]+(\.[0-9]+)?(\.[0-9]+)?' | head -1)"
        id: node_version
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: |
            {{'${{ steps.node_version.outputs.NODE_VERSION }}'}}

      - name: Tell yarn to use bash
        run: yarn config set script-shell /bin/bash

      - name: Get Yarn cache directory
        id: yarn-cache
        run: echo "::set-output name=dir::$(yarn cache dir)"
      - name: Get Yarn version hash
        id: yarn-version
        run: |
          echo "::set-output name=hash::$(yarn --version | shasum | cut -d' ' -f1)"
      - name: Get Composer cache directory
        id: composer-cache
        run: |
          echo "::set-output name=dir::$(composer global config cache-files-dir)"
      - name: Get Composer version hash
        id: composer-version
        run: |
          echo "::set-output name=hash::$(composer --version | shasum | cut -d' ' -f1)"
      - name: Cache dependencies
        uses: actions/cache@v2
        env:
          cache-name: cache-dependencies
        with:
          path: |
            {{'${{ steps.yarn-cache.outputs.dir }}'}}
            {{'${{ steps.composer-cache.outputs.dir }}'}}
          key: |
            {{'${{ runner.os }}-yarn-${{ steps.yarn-version.outputs.hash }}-composer-${{ steps.composer-version.outputs.hash }}-github_run_id-${{ github.run_id }}'}}
          restore-keys: |
            {{'${{ runner.os }}-yarn-${{ steps.yarn-version.outputs.hash }}-composer-${{ steps.composer-version.outputs.hash }}-'}}

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run static tests
        if: startsWith(github.head_ref, 'test-all/') == false
        run: yarn test:static
      - name: Run all static tests
        if: startsWith(github.head_ref, 'test-all/') == true
        run: yarn test:static:all

      - name: Run unit tests
        if: startsWith(github.head_ref, 'test-all/') == false
        run: yarn test:unit
      - name: Run all unit tests
        if: startsWith(github.head_ref, 'test-all/') == true
        run: yarn test:unit:all

      - name: Run integration tests
        if: startsWith(github.head_ref, 'test-all/') == false
        run: yarn test:integration
      - name: Run all integration tests
        if: startsWith(github.head_ref, 'test-all/') == true
        run: yarn test:integration:all

      - name: Check for uncommitted changes
        run: |
          if [[ $(git status --porcelain) ]]
          then
            >&2 echo "Error: Found uncommitted changes. Lerna publish will fail."
            git status --porcelain
            git diff
            false
          else
            echo "Success: Found no uncommitted changes"
          fi
```

```typescript
$$('git add package.json yarn.lock .github/workflows/test.yml');
$$(`git commit -m "chore: configured test workflow"`);
```

### Release workflow

The **Release** workflow runs on a scheduled interval or manual trigger and will
re-run tests before eventually tell [lerna] to tag new release versions for all
packages and merge the latest version into the `prod` branch. During
development, we schedule the release to every late afternoon, so whatever we
merge over the day gets deployed. When more users start to work on the system,
this deployment window should be adjusted according to their needs.

The new workflow file has to look like this:

```yaml
# |-> .github/workflows/release.yml
name: Release
on:
  workflow_dispatch:
  # TODO: During development, it's good to have daily releases.
  #       This should be adjusted to a regular deployment window later.
  schedule:
    - cron: '15 14 * * *'
jobs:
  version:
    name: Release
    runs-on: ubuntu-20.04
    steps:
      - name: Git mail
        run: git config --global user.email "kitt@amazee.com"
      - name: Git username
        run: git config --global user.name "K.I.T.T."

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          # TODO: Upgrade to PHP 8.
          php-version: '7.4'

      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
          ref: dev

      - name: Read .nvmrc
        run: |
          echo "##[set-output name=NODE_VERSION;]$(cat .nvmrc| grep -oE '[0-9]+(\.[0-9]+)?(\.[0-9]+)?' | head -1)"
        id: node_version
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: |
            {{'${{ steps.node_version.outputs.NODE_VERSION }}'}}

      - name: Tell yarn to use bash
        run: yarn config set script-shell /bin/bash

      - name: Get Yarn cache directory
        id: yarn-cache
        run: echo "::set-output name=dir::$(yarn cache dir)"
      - name: Get Yarn version hash
        id: yarn-version
        run: |
          echo "::set-output name=hash::$(yarn --version | shasum | cut -d' ' -f1)"
      - name: Get Composer cache directory
        id: composer-cache
        run: |
          echo "::set-output name=dir::$(composer global config cache-files-dir)"
      - name: Get Composer version hash
        id: composer-version
        run: |
          echo "::set-output name=hash::$(composer --version | shasum | cut -d' ' -f1)"
      - name: Cache dependencies
        uses: actions/cache@v2
        env:
          cache-name: cache-dependencies
        with:
          path: |
            {{'${{ steps.yarn-cache.outputs.dir }}'}}
            {{'${{ steps.composer-cache.outputs.dir }}'}}
          key: |
            {{'${{ runner.os }}-yarn-${{ steps.yarn-version.outputs.hash }}-composer-${{ steps.composer-version.outputs.hash }}-github_run_id-${{ github.run_id }}'}}
          restore-keys: |
            {{'${{ runner.os }}-yarn-${{ steps.yarn-version.outputs.hash }}-composer-${{ steps.composer-version.outputs.hash }}-'}}

      - name: Install dependencies
        run: yarn install --frozen-lockfile

      - name: Run static tests
        run: yarn test:static
      - name: Run unit tests
        run: yarn test:unit
      - name: Run integration tests
        run: yarn test:integration

      - name: Check for uncommitted changes
        run: |
          if [[ $(git status --porcelain) ]]
          then
            echo "Error: Found uncommitted changes. Lerna publish will fail."
            git status --porcelain
            git diff
            false
          else
            echo "Success: Found no uncommitted changes"
          fi

      - name: Release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: yarn lerna version -y

      - name: Merge dev -> prod
        uses: devmasx/merge-branch@1.4.0
        with:
          type: now
          target_branch: prod
          github_token: ${{ github.token }}
```

```typescript
$$('git add package.json .github/workflows/release.yml');
$$(`git commit -m "chore: configured release workflow"`);
```

[github actions]: https://github.com/features/actions

## Automatic updates

[renovate] is going to regularly update our project dependencies. We initiate
that by simply dropping this configuration file into the repository root.

```json5
// |-> renovate.json5
{
  extends: [':ignoreModulesAndTests', 'helpers:disableTypesNodeMajor'],

  ignorePaths: [
    // We want full control on the Dockerfiles.
    '.lagoon/**',
    // Same for the Node version.
    '.nvmrc',
  ],

  // This changes the behaviour of "stabilityDays"
  // - from the standard "create PR and add a stabilityDays check to it"
  // - to "create PR, but do not include updates for packages which did not pass
  //   the stabilityDays check"
  internalChecksFilter: 'strict',

  dependencyDashboard: true,

  // This will run all tests on Renovate PRs. This is required because
  // `lerna run --since` will run nothing if only the root yarn.lock is updated.
  branchPrefix: 'test-all/renovate/',

  // The "bump" strategy helps a lot with Composer updates.
  rangeStrategy: 'bump',

  // All updates, except for the major, wait for a manual approval.
  dependencyDashboardApproval: true,

  packageRules: [
    // Standard rules.
    {
      matchUpdateTypes: ['major'],
      groupName: 'all-major',
      // Give major updates a month to stabilize.
      stabilityDays: 30,
      automerge: false,
      dependencyDashboardApproval: false,
      // Drupal's security release window: Wednesdays, from 16:00 UTC to 22:00 UTC
      // https://www.drupal.org/drupal-security-team/security-release-numbers-and-release-timing#s-release-timing
      schedule: ['before 3am on thursday'],
    },
    {
      matchUpdateTypes: ['minor', 'patch', 'digest'],
      groupName: 'all-non-major',
      automerge: false,
    },
    {
      // Do not update "engines" field in package.json files.
      matchDepTypes: ['engines'],
      enabled: false,
    },

    // Package-specific rules.
    // - none yet -
  ],

  lockFileMaintenance: {
    enabled: true,
    schedule: ['at any time'],
    automerge: false,
  },
}
```

Automerge is disabled, so on Thursday morning (right after the Drupal security
release window) you'll need:

- merge `all-major` PR (created automatically)
- approve `all-non-major` PR creation on the Dependency Dashboard, then merge it
- approve `lock file maintenance` PR creation on the Dependency Dashboard, then
  merge it

Also, let's add `lock-file-changes` GitHub workflow. It creates a comment on
every PR describing changes in the Yarn dependencies. Because Renovate is not
always accurate with change reports and there is no change report in the
`lock file maintenance` PR.

<!-- prettier-ignore-start -->
```yml
# |-> .github/workflows/lock-file-changes.yml

name: Lock File Changes
on: [pull_request]
jobs:
  lock_file_changes:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
        with:
          fetch-depth: 0

      # yarn.lock
      - name: Yarn Lock Changes
        uses: Simek/yarn-lock-changes@main
        with:
          token: {{'${{ secrets.GITHUB_TOKEN }}'}}
          collapsibleThreshold: 1
```
<!-- prettier-ignore-end -->

```typescript
$$('git add renovate.json5 .github/workflows/lock-file-changes.yml');
$$(`git commit -m "chore: configured renovate"`);
```

[renovate]: https://github.com/renovatebot/renovate

## Pull request template

Pull requests descriptions should always contain certain information. We can add
a template that will remind everybody about this.

```markdown
|-> .github/pull_request_template.md

## Description of changes

<!-- a brief summary of your code changes -->

## Motivation and context

<!-- why is this PR necessary? is someone experiencing bugs or is a new feature being implemented? -->

## Related Issue(s)

<!-- make sure you link with either an `#issue-number` or directly with `[link-text](url)` -->

## How has this been tested?

<!-- locally? written tests? -->

## Screenshot

<!-- uncomment the snippet below and add the screenshot -->
<!--
<details>
  <summary>Click to expand!</summary>

  ![Screenshot](image-source)
</details>

-->
```

```typescript
$$('git add .github/pull_request_template.md');
$$(`git commit -m "chore: add pull request template"`);
```

## Readme file

Let's add a readme file, so whenever somebody stumbles on our new project, they
are directed to this documentation right away.

```typescript
$$.vars({
  projectName: projectName.toUpperCase(),
});
```

```markdown
|-> README.md

# {{projectName}}

This project was created with [amazee-recipes].

[amazee-recipes]: https://www.npmjs.com/package/@amazeelabs/recipes
```

Don't forget to add the new `README.md` to the repository.

```typescript
$$(`git add README.md`);
$$(`git commit -m "chore: initiate README.md"`);
```

## Makes sure everything has been committed

At this point we should be on the `dev` branch, and the working directory should
be clean.

```typescript
$$('git branch', {
  stdout: /^\* dev$/m,
});

$$('git status --porcelain', {
  stdout: (output) =>
    output.trim().length !== 0
      ? `uncommitted changes:\n${output}\n`
      : undefined,
});
```

## Next steps

You are good to push the `dev` branch or proceed with the next steps:

- `amazee-recipes add-gatsby`
