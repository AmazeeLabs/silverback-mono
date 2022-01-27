# Amazee Recipes

Automated recipes for recurring tasks.

## Installation

NPM: `npm install -g @amazeelabs/recipes`

Yarn: `yarn global add @amazeelabs/recipes`

## Upgrade

If installed with NPM: `npm update -g @amazeelabs/recipes`

If installed with Yarn: `yarn global upgrade @amazeelabs/recipes`

## Usage

If installed with NPM: `amazee-recipes`

If installed with Yarn: `yarn exec amazee-recipes`

## Contributing recipes

Recipes are stored in the [`recipes`][recipes] directory. Simply add your recipe
and create a pull request against `silverback-mono`.

[recipes]:
  https://github.com/AmazeeLabs/silverback-mono/tree/development/packages/npm/%40amazeelabs/recipes/recipes

## How to write a recipe

### Executing commands

A recipe is a markdown file with typescript codeblocks that are executed when
running the recipe. Technically you can import any other library and execute
arbitrary Typescript code. To ease things a little, there is a global `$$`
helper object that gives the recipe access to common tasks like logging, prompts
and file management.

### Generating files

When a codeblock contains a line that has `|-> [filename]` in it, it will not
execute, but render the content into that file.

This ...

```typescript
// |-> test.js
console.log('test');
```

... will write a file called `test.js` with this content:

```typescript
console.log('test');
```

`>-> [filename]` does the same, but appends the contents to the file instead of
overriding it.

Files run through [Nunjucks](https://mozilla.github.io/nunjucks/), and it is
possible to provide variables and dynamically replace them.

```typescript
$$.vars({
  file: 'test.js',
  message: 'Hello world!',
});
```

```typescript
// |-> {{file}}
console.log('{{message}}');
```

Outcome in `test.js`:

```typescript
console.log('Hello world!');
```

### Helpers API

#### Run bash commands with `$$`

Simple shell commands can be run using the `$$` function. The recipe will fail
if the command returns with a non-zero exit code.

```typescript
$$('mkdir test');
```

It is also possible to test for specific exit codes instead. In this case, the
recipe will fail if the command _does not_ return exit code `1`.

```typescript
$$('command-that-does-not-exist', {
  code: 1,
});
```

It is also possible to run assertions against `stdout` or `stderr` of a command.
The API expects either a regular expression, or a validation function.

```typescript
$$('echo "foo"', {
  stdout: /foo/,
});

$$('echo "bar"', {
  stdout: (output) => output.length > 2,
});

$$('command-that-does-not-exist', {
  stderr: /not found/,
});
```

#### Check versions with `$$.minimalVersion`

The `$$.minimalVersion` helper can be combined with `$$` to check for minimal
versions of the execution environment. It uses the
[semver](https://www.npmjs.com/package/semver) package to parse and compare
version numbers.

This for example will fail, if no PHP < 7.4 or no PHP at all is available.

```typescript
$$('php -v', {
  stdout: $$.minimalVersion('7.4'),
});
```

#### Working with `$$.file`

The `$$.file` helper function provides read, write and modify operations for
files. It accepts a file path, and an optional processing function. If the file
exists, its content is parsed (depending on the filetype), passed into the
processing function, and the output will be written back into the file. If the
file does not exist, the input for the processor will be empty, and the file
will be created.

`*.json`, `*.yml` and `*.yaml` files are parsed, and the content is passed in as
a javascript object. This allows for simple declarative modification of files
using spread operators:

```typescript
$$.file('package.json', (content) => ({
  ...content,
  author: 'AmazeeLabs <development@amazeelabs.com>',
  scripts: {
    ...content.scripts,
    test: 'jest',
  },
}));
```

All other files are processed as array of lines.

```typescript
$$.file('.gitignore', (content) => [...content, 'node_modules']);
```

#### Logging

`$$.log` gives you access to an instance of
[tslog](https://www.npmjs.com/package/tslog) for pretty logging.

#### Getting information from the user

`$$.prompts` is essentially [promps](https://www.npmjs.com/package/tslog), but
all promises are resolved synchronously, so you can directly use the users input
in the recipe.

```typescript
// Choose a project name.
const { message } = $$.prompts({
  type: 'text',
  name: 'message',
  message: 'Enter a message:',
});
```

## How to test recipes

Manual testing is possible with
`yarn prepare && LOG=silly node ./dist/index.js my-recipe`.
