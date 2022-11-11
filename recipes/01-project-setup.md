# Initial project setup

[AmazeeLabs] projects are [pnpm] mono-repositories, consisting of multiple
packages and applications. To operate them on a development machine, [git] and
[pnpm] are required.

```typescript
if (!(await $`git --version`).stdout.match(/^git version 2/)) {
  throw 'Unsupported version of git.';
}

if (!(await $`pnpm --version`).stdout.match(/^7./)) {
  throw 'Unsupported version of pnpm.';
}
```

First of all we have to come up with a name for the new project.

```typescript
const projectNameRegex = /^[a-z][a-z\d_]+$/;
const projectNameMessage =
  'Project names must start with a letter ' +
  'and contain lower case letters, numbers and underscores only.';

await prompt('PROJECT_NAME', {
  type: 'text',
  message: 'Choose a project name:',
  validate: (name) =>
    !projectNameRegex.test(name) ? projectNameMessage : true,
});
```

Now we can create the project directory and continue to work there.

```typescript
await $`mkdir $PROJECT_NAME`;
cd(process.env.PROJECT_NAME);
```

Store Node.js version in `.npmrc` file. This makes [pnpm] use it for all
processes.

```text title="./.npmrc"
use-node-version=16.18.0
```

Initiate an empty pnpm workspaces package.

```json title="./package.json"
{
  "name": "PROJECT_NAME",
  "private": true
}
```

## Commit conventions

We use the [conventional commits] standard for commit messages and [husky] in
tandem with [commitlint] to enforce them. We use the current Ticket number as
the scope.

It is a good practice to reference other colleagues involved in commits, even if
they did not contribute code (product managers, designers), so we are better
able to find out who took decisions and follow up on them.

    feat(#SHOP-1234): display variants on product page

    Variants are displayed on the product page, along with their
    "add-to-cart" buttons.

    Co-authored-by: Leksat <alex@amazeelabs.com>
    Co-authored-by: Zsofiag <zsofia@amazeelabs.com>

First, install the suite of packages around conventional commits. Since these
are only used by developers, and not required for building or running the
application, we mark them as "optional" dependencies.

```shell
pnpm add -O @commitlint/{cli,config-conventional}
```

We also have to add the [commitlint] configuration to package.json

```yaml title="./.commitlintrc.yaml"
extends: ['@commitlint/config-conventional']
```

This allows us to use the [commitlint] CLI to check commit messages, but they
are not enforced automatically. That's the job of [husky]. Add the dependency a
`postinstall` to that will take care of installing the git hooks whenever the
project is cloned and installed for the first time. We also don't want the
`postinstall` step to fail if the project has been installed without optional
dependencies.

```shell
pnpm add -O husky
```

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    postinstall: 'husky install || true',
  },
}));
```

Initiate the git repository and tell husky to check every commit message against
the [conventional commit] standards. This also requires a `.husky` directory at
the project root, as well as `postinstall` to be run afterwards, so the hooks
are installed initially. By convention, the main development branch in
silverback projects should be named `dev`:

```shell
git init -b dev
mkdir .husky
pnpm husky add .husky/commit-msg 'pnpm commitlint --edit "$1"'
pnpm postinstall
```

We do not want the `node_modules` directory in the git repository, so we create
a `.gitignore` file to ignore it.

```ignore title="./.gitignore"
node_modules
```

Now initiate the git repository and stage all the changes for our first commit:

```shell
git add .npmrc .gitignore package.json pnpm-lock.yaml .husky .commitlintrc.yaml
```

Committing with an invalid message should fail now:

```typescript
const commitResult = await $`git commit -m "fixes!!!"`.nothrow();
if (commitResult.exitCode === 0) {
  throw 'Commit conventions not enforced.';
}
```

If we behave though, husky will allow us to do our first commit now.

```shell
git commit -m "chore: setup monorepo and commit conventions"
```

## Workspaces

[pnpm] already provides the concept of [workspaces]. It allows use to manage
multiple [npm] packages within the same repository and connect them to each
other. All we have to do is to drop a `pnpm-workspace.yaml` in our project
directory.

```yaml title="./pnpm-workspace.yaml"
packages:
  - apps/**
  - packages/**
```

It registers two types of packages, `apps` and `packages`. As a rule of thumb:
`apps` are applications that run in production (e.b. Drupal or Gatsby), while
`packages` are just used, like UI libraries.

```shell
git add pnpm-workspace.yaml
git commit -m "chore: configure pnpm workspaces"
```

## Coding standards and quality

[Prettier] and [ESLint] are our standard code quality tools. They make sure
basic rules are met and all code formatting happens in a standardized way. Both
tools are integrated into editors and IDE's like PHPStorm or VSCode and can
provide auto-formatting, hints and fix intentions.

[prettier]: https://prettier.io
[eslint]: https://eslint.org

### Prettier

Prettier provides opinionated formatting for all kinds of languages, from
Typescript, JSON and Yaml to GraphQL and even PHP. Let's start by installing it
and the plugin for PHP.

```shell
pnpm add -O -w prettier @prettier/plugin-php
```

We also need to add a configuration file to the project root.

```javascript title="./.prettierrc.js"
module.exports = {
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'always',
  printWidth: 80,
  useTabs: false,
  tabWidth: 2,
  plugins: [require.resolve('@prettier/plugin-php')],
  braceStyle: '1tbs',
};
```

Let's test formatting of a Typescript file. The configuration file above defines
that we should prefer single quotes.

```text title="./test.ts"
"Hello, world!";
```

Now we run prettier to format that file and assert that the double quotes have
been replaced with single ones.

```typescript
await $`pnpm prettier --write test.ts`;
if ((await fs.readFile('test.ts', 'utf8')) !== "'Hello, world!';\n") {
  throw 'Prettier did not format the file correctly.';
}
```

Now let's do the same with a PHP file.

```php title="./test.php"
<?php
"Hello, world!";
```

```typescript
await $`pnpm prettier --write test.php`;
if ((await fs.readFile('test.php', 'utf8')) !== "<?php\n'Hello, world!';\n") {
  throw 'Prettier did not format the file correctly.';
}
```

We can remove our test files again.

```shell
rm test.ts test.php
```

Let's commit the addition and configuration of Prettier.

```shell
git add package.json pnpm-lock.yaml .prettierrc.js
git commit -m "chore: add and configure prettier"
```

### ESLint

ESLint is used to enforce common rules on our code, to avoid mistakes when for
example using React hooks. Therefore, it requires a couple of plugins. We can
install all of them at once.

```shell
pnpm add -O -w eslint eslint-config-prettier eslint-plugin-no-only-tests eslint-plugin-formatjs eslint-plugin-import eslint-plugin-promise eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-simple-import-sort eslint-plugin-storybook eslint-plugin-tailwindcss typescript @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

And again, we need a configuration file with a set oft sensible presets.

```javascript title="./.eslintrc.js"
module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:promise/recommended',
    'plugin:react/recommended',
    // Prettier always goes last.
    'prettier',
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    react: {
      version: '18',
    },
  },
  plugins: [
    '@typescript-eslint',
    'tailwindcss',
    'promise',
    'simple-import-sort',
    'import',
    'no-only-tests',
    'react',
    'react-hooks',
  ],
  rules: {
    'no-unused-vars': ['off'],
    '@typescript-eslint/no-unused-vars': ['error'],
    'simple-import-sort/imports': 'error',
    'sort-imports': 'off',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-duplicates': 'error',
    'no-only-tests/no-only-tests': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/prop-types': ['off'],
    'react/prefer-stateless-function': ['error'],
    'react/react-in-jsx-scope': ['off'],
  },
};
```

ESLint can report violations while statically testing, but also fix some of them
for us. Let's test that. Create a simple typescript file with fake imports that
violate the import sorting rules.

```typescript title="./test.ts"
import x from './b';
import y from 'a';
```

ESLint should complain now that there is a relative import before an external
one.

```typescript
const eslintResult = await $`pnpm eslint test.ts`.nothrow();
if (eslintResult.code === 0) {
  throw 'ESLint did not report any violations.';
}
```

We can now instruct eslint to fix as much as we can. Which should at least put
the relative import below and on a second line. It will still fail though, since
we have unused variables that will be reported.

```typescript
const eslintFixResult = await $`pnpm eslint --fix test.ts`.nothrow();
if (eslintFixResult.code === 0) {
  throw 'ESLint did not report any violations.';
}

if (
  (await fs.readFile('test.ts', 'utf8')) !==
  "import y from 'a';\n\nimport x from './b';"
) {
  throw 'ESLint did not fix the file correctly.';
}
```

ESLint is working as it should. Let's remove the test file again and commit our
changes.

```shell
rm test.ts
git add package.json pnpm-lock.yaml .eslintrc.js
git commit -m "chore: add and configure eslint"
```

### Lint staged

We have now rules for formatting and linting, and they will be enforced during
CI test runs, but we would like to avoid the friction of accidentally committing
malformed code and waiting for the test run to tell us. [lint-staged] helps us
to fix dumb mistakes before they happen.

Install [lint-staged] and [micromatch]. The latter is used for the lint-staged
configuration.

```shell
pnpm add -O -w lint-staged
```

Add a configuration file for [lint-staged] that runs eslint and prettier on all
staged files and attempts to fix any violations.

```javascript title="./lint-staged.config.js"
// Files that should be linted.
const eslintPattern = /.*\.(ts|js|tsx|jsx)$/;
// Files that should be formatted.
const prettierPattern =
  /.*\.(ts|js|tsx|jsx|gql|graphql|graphqls|php|module|install|md|yml|yaml|json)$/;

module.exports = (allStagedFiles) => {
  const lint = allStagedFiles.filter((file) => eslintPattern.test(file));
  const format = allStagedFiles.filter((file) => prettierPattern.test(file));

  return ['prettier -w ' + format.join(' '), 'eslint --fix ' + lint.join(' ')];
};
```

For [lint-staged] to work, we have to commit everything up until now.

```shell
git add package.json pnpm-lock.yaml lint-staged.config.js
git commit -m "chore: install and configure lint-staged"
```

To test if it works correctly, we add two files that contain formatting errors.

```typescript title="./a.ts"
export function a() {
  return 'a';
}
```

```text title="./b.ts"
export function b() { return "b";}
```

We stage only one of them.

```shell
git add a.ts
```

If we run `lint-staged` now, it should only fix the staged file.

```shell
pnpm lint-staged
```

```typescript
if (
  (await fs.readFile('a.ts', 'utf8')) !==
  `export function a() {\n  return 'a';\n}\n`
) {
  throw 'Staged file a was not formatted.';
}
if (
  (await fs.readFile('b.ts', 'utf8')) !== `export function b() { return "b";}`
) {
  throw 'Un-staged file a was formatted.';
}
```

If all worked correctly, we can un-stage and remove our test files.

```shell
git restore --staged a.ts
rm a.ts b.ts
```

Order husky to lint and format every staged file before committing.

```typescript
await $`pnpm husky add .husky/precommit 'pnpm lint-staged'`;
```

This produces a new husky hook that also has to be committed.

```shell
git add .husky
git commit -m "chore: run lint-staged on pre-commit"
```

## GraphQL Schema

### Schema definition

Every project is built around a GraphQL schema definition that describes its
data structure and the operations that can be performed on it. It lives along
with the query operations in a `graphql` folder at the project root.

```shell
mkdir graphql
mkdir graphql/fragments
mkdir graphql/operations
```

There we find the central `schema.graphqls`, which describes the schema acts as
the central point of documentation and type definition for the whole project.
There we define the first fundamental datatype - the `Account` .

```graphql title="./graphql/schema.graphqls"
type Query {
  # Retrieve the currently logged in account.
  currentAccount: Account
}

type Mutation {
  # Log in with the given credentials.
  login(name: String!, pass: String!): Account
  # Log out the currently logged in account.
  logout: Boolean
}

# An account that can log in to the system.
type Account {
  # The unique identifier of the account.
  id: ID!
  # The name of the account.
  name: String!
  # The user roles, associated with this account.
  roles: [String!]!
}
```

The `graphql` folder also contains `operations` and `fragments`. Operations are
queries and mutations that are run against the schema. Fragments are reusable
parts of queries and mutations that can be used to reduce duplication and
provide type definitions.

We create our first fragment that fetches all information about the current user
account, aptly named `AccountInfo`.

```graphql title="./graphql/fragments/Account.gql"
fragment AccountInfo on Account {
  id
  name
  roles
}
```

This fragment is used by the first operations.

```graphql title="./graphql/operations/Account.gql"
query AccountStatus {
  currentAccount {
    ...AccountInfo
  }
}

mutation AccountLogin($name: String!, $pass: String!) {
  login(name: $name, pass: $pass) {
    ...AccountInfo
  }
}

mutation AccountLogout {
  logout
}
```

That's a great summary of what the application should be able to do. Before we
put it into use, we commit our changes.

```shell
git add graphql
git commit -m "feat: add graphql schema for session management"
```

### Code generation

The schema definition is great for documentation, but it also serves as input
for a code generation process that will create the necessary types and
operations for us. That way, [typescript] can make sure that all parts of the
application agree on the same type definitions in the schema.

First of all, we create a new package called `schema` that will host our
generated code.

```typescript
await fs.mkdirp('packages/schema');
cd('packages/schema');
```

```json title="./package.json"
{
  "name": "@PROJECT_NAME/schema",
  "description": "Generated GraphQL schema",
  "main": "build/index.ts",
  "private": true
}
```

Now, we install [graphql-codegen] and a set of plugins along with it.

```shell
pnpm add -D @graphql-codegen/{cli,typescript,typescript-operations} graphql typescript @amazeelabs/codegen-operation-ids
```

The `codegen.yml` configuration file defines files that we want to generate and
their inputs.

```yaml title="./codegen.yml"
schema: ../../graphql/schema.graphqls
documents: ../../graphql/**/*.gql
generates:
  # Type definitions for schema types, operations and persisted operation ids.
  build/index.ts:
    plugins:
      - typescript
      - typescript-operations
      - '@amazeelabs/codegen-operation-ids'
  # A map of operation id's to actual graphql operations to be used by a
  # graphql server implementation.
  build/map.json:
    plugins:
      - '@amazeelabs/codegen-operation-ids'
```

Codegen is run from a script in the `package.json`. It also copies the schema
definition into the packages build folder, to easily make it available to
deployed apps later on.

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    build:
      'graphql-codegen && cp ../../graphql/schema.graphqls build/schema.graphqls',
  },
}));
```

Running the command will create a `build` folder containing the files we defined
in `config.yml`.

```typescript
await $`pnpm build`;

if (!(await fs.exists('build/index.ts'))) {
  throw 'Code was not generated.';
}

if (!(await fs.exists('build/map.json'))) {
  throw 'Persisted operation map was not created.';
}

if (!(await fs.exists('build/schema.graphqls'))) {
  throw 'Schema was not copied.';
}
```

Before we commit our work we should make sure that the generated files are
ignored by git. We do that by adding rule to our project-wide `.gitignore` .

```typescript
cd('../../');
```

```diff
Index: .gitignore
===================================================================
--- .gitignore
+++ .gitignore
@@ -1,1 +1,2 @@
-node_modules
+node_modules
+build
```

```shell
git add .gitignore packages/schema pnpm-lock.yaml
git commit -m "feat: add graphql schema code generation"
```

### Voyager application

As a first application, we are going to add [GraphQL Voyager] to our project.
It's a very simple example to test the repository layout and even brings value
by providing a visual representation of the schema.

[graphql voyager]: https://github.com/IvanGoncharov/graphql-voyager

```typescript
await $`mkdir -p apps/voyager`;
cd('apps/voyager');
```

```json title="./package.json"
{
  "name": "@PROJECT_NAME/voyager",
  "private": true,
  "type": "module",
  "version": "0.0.0"
}
```

Our little application will consist of a single typescript file that starts an
[express] server hosting [GraphQL Voyager]. To transpile the typescript code, we
use [rollup], so lets start by adding the necessary dependencies.

```shell
pnpm add -D typescript rollup @rollup/plugin-typescript rollup-plugin-string @types/express
```

At runtime, we will need express, graphql voyager, apollo server and their peer
dependencies.

```shell
pnpm add express graphql graphql-voyager apollo-server-express react@16 react-dom@16
```

The application needs access to the defined schema. Instead of simply
referencing the schema at the root level, we add a workspace dependency to the
local `schema` package. This will make sure the build pipeline can optimize its
process.

```typescript
const schemaPackage = `@${process.env.PROJECT_NAME}/schema`;
file('./package.json', (json) => ({
  ...json,
  dependencies: {
    ...json.dependencies,
    [schemaPackage]: 'workspace:*',
  },
}));
```

Run `pnpm install` again to make sure the workspace dependency is resolved.

```shell
pnpm install
```

Time to add the actual application code in the `src` folder.

```shell
mkdir src
```

```typescript title="./src/index.ts"
import { ApolloServer, gql } from 'apollo-server-express';
import express from 'express';
import voyager from 'graphql-voyager/middleware';

// Relative import because the rollup string plugin does not work in tandem
// with the node-resolve plugin.
// @ts-ignore
import schema from '../node_modules/@PROJECT_NAME/schema/build/schema.graphqls';

const server = new ApolloServer({ typeDefs: gql(schema) });

const app = express();
server
  .start()
  .then(() => {
    server.applyMiddleware({ app });
    app.use('/', voyager.express({ endpointUrl: '/graphql' }));

    const port = process.env.PORT || 4000;

    return app.listen(port, () => {
      console.log(`listening on http://0.0.0.0:${port}`);
    });
  })
  .catch((err) => {
    console.error(err);
  });
```

To be able to start the application, we need to transpile it. Therefore, we add
the rollup configuration, typescript configuration and inject a build and start
script into `package.json`.

```json title="./tsconfig.json"
{
  "compilerOptions": {
    "target": "esnext",
    "module": "esnext",
    "moduleResolution": "Node",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "$schema": "https://json.schemastore.org/tsconfig",
  "display": "Recommended"
}
```

```javascript title="./rollup.config.js"
import typescript from '@rollup/plugin-typescript';
import { string } from 'rollup-plugin-string';

export default {
  input: 'src/index.ts',
  output: {
    format: 'cjs',
    file: 'build/index.cjs',
  },
  plugins: [string({ include: '**/*schema.graphqls' }), typescript()],
  external: [
    'express',
    'apollo-server-express',
    'graphql-voyager/middleware',
    'fs',
  ],
};
```

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    build: 'rollup -c rollup.config.js',
    start: 'node build/index.cjs',
  },
}));
```

At this point we should be able to run the build script and verify the
executable application is there.

```shell
pnpm build
```

```typescript
if (!(await fs.exists('build/index.cjs'))) {
  throw 'Voyager application was not built.';
}
```

The application is so simple that unit tests would be overkill. But we can at
least make sure there are no typescript errors.

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'test:static': 'tsc --noEmit',
  },
}));
```

```shell
pnpm test:static
```

```typescript
cd('../../');
```

```shell
git add apps/voyager
git commit -m "feat: graphql schema display application"
```

## Task runner

Now that we have our first build task, we should think about efficiently running
it, and its future cousins. [Turborepo] is exactly the tool for that. It allows
us to define task pipelines with dependencies and input/output artifacts that
will then be run and cached as fast as possible.

It's installed as an optional dependency, since we don't want it in docker
images.

```shell
pnpm add -O -w turbo
```

Now we can create our first pipelines in `turbo.json`. This file is

- `build`: Prepare each package to be executable.
- `test:static`: Run static tests (linting, formatting, type-checks etc.).
- `test:unit`: Fast running unit tests like vitest.
- `test:integration`: Slow running integration tests that actually start the
  application.

```json title="./turbo.json"
{
  "$schema": "https://turborepo.org/schema.json",
  "pipeline": {
    "build": {
      // A package's `build` script depends on that package's
      // dependencies and devDependencies
      // `build` tasks  being completed first
      // (the `^` symbol signifies `upstream`).
      "dependsOn": ["^build"],
      // By default, the build task will produce a "build" folder
      // in the packages directory.
      "outputs": ["build/**"],
      // Builds should only re-run when files in src change.
      "inputs": ["src/**"]
    },
    "test:static": {
      // Static tests don't require a build of the package, but they
      // require dependencies to be built, since these might contain
      // type definitions.
      "dependsOn": ["^build"],
      "outputs": [],
      // Static tests only have to be re-run when something in the "src"
      // folder changes.
      "inputs": ["src/**"]
    },
    "test:unit": {
      // Unit tests also don't require the package to be built since test
      // tools build packages on the fly. Dependencies need to be built though.
      // Also unit tests should not even run without static tests passing or
      // dependencies unit tests failing.
      "dependsOn": ["^build", "test:static", "^test:unit"],
      "outputs": [],
      // Unit tests only have to be re-run when something in the "src"
      // folder changes.
      "inputs": ["src/**"]
    },
    "test:integration": {
      // Integration tests run the full system and require the package to be
      // built and unit tested.
      "dependsOn": ["build", "test:unit"],
      "outputs": [],
      // Integration tests only have to be re-run when something in the "src"
      // folder changes.
      "inputs": ["src/**"]
    },
    // Package specific overrides.
    "@PROJECT_NAME/schema#build": {
      // The schema package as different inputs than other packages.
      "inputs": ["../../graphql/**"]
    },
    "@PROJECT_NAME/voyager#build": {
      // The voyager package has different inputs than other packages.
      "inputs": ["./src", "rollup.config.js", "tsconfig.json"]
    }
  }
}
```

Let's add a new script to the root `package.json` that will build the project
with [Turborepo].

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    build: 'turbo build',
    test: 'turbo test:integration',
  },
}));
```

Running the build script now should run codegen in our schema package.

```shell
pnpm build
```

Running the build script again should be much faster and signal that the turbo
caches were used.

```typescript
const buildOutput = (await $`pnpm build`).stdout;
if (!/FULL TURBO/.test(buildOutput)) {
  throw 'Turbo did not use its cache.';
}
```

Turbo places `.turbo` cache directories in each package. These can be safely
ignored by git.

```typescript
file('.gitignore', (lines) => [...lines, '.turbo']);
```

With the build pipeline in place, it's time to commit our changes.

```shell
git add .gitignore turbo.json package.json pnpm-lock.yaml
git commit -m "feat: add turbo build pipeline"
```

## Automatic updates

[renovate] is going to regularly update our project dependencies. We initiate
that by simply dropping this configuration file into the repository root.

```json title="./renovate.json5"
{
  "extends": [":ignoreModulesAndTests", "helpers:disableTypesNodeMajor"],

  "ignorePaths": [
    // We want full control on the Dockerfiles.
    ".lagoon/**"
  ],

  // This changes the behaviour of "stabilityDays"
  // - from the standard "create PR and add a stabilityDays check to it"
  // - to "create PR, but do not include updates for packages which did not pass
  //   the stabilityDays check"
  "internalChecksFilter": "strict",

  "dependencyDashboard": true,

  "branchPrefix": "renovate/",

  // All updates, except for the major, wait for a manual approval.
  "dependencyDashboardApproval": true,

  // Pin dependencies by default.
  "rangeStrategy": "pin",

  "packageRules": [
    // Use "bump" range strategy for resolutions.
    {
      "matchPaths": ["package.json"],
      "matchDepTypes": ["resolutions"],
      "rangeStrategy": "bump"
    },
    // Use "bump" range strategy for special dependency types.
    {
      "matchPaths": ["**/package.json"],
      "matchDepTypes": [
        "peerDependencies",
        "bundledDependencies",
        "optionalDependencies"
      ],
      "rangeStrategy": "bump"
    },

    // Standard rules.
    {
      "matchUpdateTypes": ["major"],
      "groupName": "all-major",
      // Give major updates a month to stabilize.
      "stabilityDays": 30,
      "automerge": false,
      // We need to automate PR creation in order to make the stabilityDays
      // option work.
      "dependencyDashboardApproval": false,
      // Drupal's security release window: Wednesdays, from 16:00 UTC to 22:00 UTC
      // https://www.drupal.org/drupal-security-team/security-release-numbers-and-release-timing#s-release-timing
      "schedule": ["before 3am on thursday"]
    },
    {
      "matchUpdateTypes": ["minor", "patch", "digest"],
      "groupName": "all-non-major",
      "automerge": false
    },
    {
      // Do not update "engines" field in package.json files.
      "matchDepTypes": ["engines"],
      "enabled": false
    },

    // Package-specific rules.
    {
      "paths": ["apps/cms/composer.json"],
      "packageNames": [
        // Lagoon's drupal_integrations module does not support Drush 11 yet. So
        // we stay on Drush 10 for now.
        // TODO: Remove once https://github.com/amazeeio/drupal-integrations/issues/7 is resolved.
        "drush/drush"
      ],
      "updateTypes": ["major"],
      "enabled": false
    }
  ],

  "lockFileMaintenance": {
    "enabled": true,
    "schedule": ["at any time"],
    "automerge": false
  }
}
```

Automerge is disabled, so on Thursday morning (right after the Drupal security
release window) you'll need:

- merge `all-major` PR (created automatically)
- approve `all-non-major` PR creation on the Dependency Dashboard, then merge it
- approve `lock file maintenance` PR creation on the Dependency Dashboard, then
  merge it

[//]: # 'TODO: Replicate lock file changes with pnpm.'

```shell
git add renovate.json5
git commit -m "ci: automatic updates with renovate"
```

## Pull request template

Pull requests descriptions should always contain certain information. We can add
a template that will remind everybody about this.

```shell
mkdir -p .github
```

```markdown title="./.github/pull_request_template.md"
## Description of changes

<!-- a brief summary of your code changes -->

## Motivation and context

<!-- why is this PR necessary? is someone experiencing bugs or is a new feature being implemented? -->

## How has this been tested?

- [ ] Manually
- [ ] Unit tests
- [ ] Integration tests
```

```shell
git add .github/pull_request_template.md
git commit -m "chore: add pull request template"
```

## Continuous integration

We use [Github Actions] for continuously testing and deploying our project. The
fundamental process consists of two workflows.

### Setup

All workflows will require some basic repository setup. To avoid duplication, we
can move these steps into a local action.

```shell
mkdir -p .github/actions/setup
mkdir -p .github/workflows
```

```yaml title="./.github/actions/setup/action.yml"
name: 'Setup'
description: 'Common setup steps for GitHub Actions'
runs:
  using: 'composite'
  steps:
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: 16

    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'

    - uses: pnpm/action-setup@v2.2.4
      name: Install pnpm
      with:
        version: 7
        run_install: false
    #
    - uses: actions/cache@v3
      name: Setup pnpm cache
      with:
        path: /home/runner/.local/share/pnpm/store/v3
        key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
        restore-keys: |
          ${{ runner.os }}-pnpm-store-

    - name: Install dependencies
      shell: bash
      run: pnpm install
```

### Test workflow

The **Test** workflow runs on every pull request against the `dev` branch, which
always contains the latest version for internal testing. It will install all
dependencies and then run the `test` script which invokes [turborepo] to build
the required packages and run all tests.

```yaml title="./.github/workflows/test.yml"
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
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup

      - name: Test
        run: pnpm test
```

### Release workflow

The **Release** workflow runs on a manual trigger and will re-run tests before
eventually merging the latest version into the `prod` branch.

The new workflow file has to look like this:

```yaml title="./.github/workflows/release.yml"
name: Release
on:
  workflow_dispatch:
jobs:
  test:
    name: Test
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout
        uses: actions/checkout@v3

      - name: Setup
        uses: ./.github/actions/setup

      - name: Test
        run: pnpm test

      - name: Merge dev -> prod
        uses: devmasx/merge-branch@1.4.0
        with:
          type: now
          target_branch: prod
          github_token: ${{ github.token }}
```

```shell
git add .github
git commit -m "ci: github workflows for testing and releasing"
```

## Lagoon and Docker

Most of our projects are hosted on [lagoon], which is a container-based hosting
platform. We have to create a `docker-composer.yml` and Dockerfiles for each
application in the monorepo.

```yaml title="./.lagoon.yml"
docker-compose-yaml: docker-compose.yml
project: 'PROJECT_NAME'
```

We can already add a lagoon service to host our [GraphQL Voyager] application.

```yaml title="./docker-compose.yml"
version: '2.3'

x-environment: &default-environment
  LAGOON_PROJECT: &lagoon-project ${COMPOSE_PROJECT_NAME:-PROJECT_NAME}
  LAGOON_ROUTE: &default-url http://${COMPOSE_PROJECT_NAME:-PROJECT_NAME}.docker.amazee.io
  LAGOON_ENVIRONMENT_TYPE: production

services:
  voyager:
    build:
      context: .
      dockerfile: .lagoon/voyager.Dockerfile
    labels:
      lagoon.type: node
    user: root
    volumes_from:
      - container:amazeeio-ssh-agent
    environment:
      <<: *default-environment
      LAGOON_LOCALDEV_URL: voyager-${COMPOSE_PROJECT_NAME:-caritas}.docker.amazee.io
    networks:
      - amazeeio-network
      - default

networks:
  amazeeio-network:
    external: true
```

The builder dockerfile goes into the `.lagoon` directory. It uses [pnpm]'s
"fetch" feature to use docker layer caching efficiently and only re-fetch
dependencies when the `pnpm-lock.yaml` changes.

```shell
mkdir -p .lagoon
```

```dockerfile title="./.lagoon/voyager.Dockerfile"
FROM uselagoon/node-18-builder as builder

# Install pnpm
RUN npm install -g pnpm
# Copy pnpm lockfile and install only dependencies required for building.
COPY pnpm-lock.yaml /app/
RUN pnpm fetch --no-optional

# Copy the all package sources, install dev packages from local storage and build.
COPY . /app
RUN pnpm install --no-optional --frozen-lockfile --prefer-offline
RUN pnpm build:docker

# Produced a pruned package for the current application and its runtime dependencies.
RUN pnpm deploy --filter "@PROJECT_NAME/voyager" .deploy --prod

FROM uselagoon/node-18
COPY --from=builder /app/.deploy /app

ENV PORT=3000
```

We install without optional dependencies, which unfortunately means tha
[turborepo] won't work. Since we are not running any tests during docker build
anyway, that's not a huge issue. But we need a specific `build:docker` command
that will build all packages recursively.

```typescript
file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'build:docker': 'pnpm run -r build',
  },
}));
```

The docker image already has a built in node version, and it does not like when
pnpm attempts to switch it, so we ignore the `.npmrc` file. Also we don't want
any local `node_modules`, build artifacts or caches to be included in the docker
scope.

```ignore title="./.dockerignore"
.npmrc
node_modules
build
.turbo
```

```shell
git add .dockerignore package.json docker-compose.yml .lagoon
git commit -m "ci: lagoon integration"
```

[renovate]: https://github.com/renovatebot/renovate
[github actions]: https://github.com/features/actions
[turborepo]: https://turborepo.org/
[graphql-codegen]: https://www.the-guild.dev/graphql/codegen
[typescript]: https://www.typescriptlang.org/
[micromatch]: https://www.npmjs.com/package/micromatch
[lint-staged]: https://github.com/okonet/lint-staged
[conventional commits]: https://www.conventionalcommits.org/en/v1.0.0/
[husky]: https://www.npmjs.com/package/husky
[commitlint]: https://github.com/conventional-changelog/commitlint
[git]: https://git-scm.com
[amazeelabs]: https://www.amazeelabs.com
[pnpm]: https://pnpm.io/
[workspaces]: https://pnpm.io/workspaces
