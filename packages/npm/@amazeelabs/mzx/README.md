# MZX

_"Markdown ZX"_ - A wrapper around [ZX] that parses and interprets code blocks
in markdown files.

## Usage

To make things easier, create an alias in your shell configuration:

```shell
alias mzx="npx @amazeelabs/mzx"
```

Now you should be able to run a script with:

```shell
mzx run my-tutorial.md
```

## Writing scripts

### Typescript blocks

MZX scripts are regular markdown files. Any code blocks in the `typescript`
language will be concatenated to a [ZX] script and executed.

````markdown
# Setup instructions

First run this:

```typescript
await $`rm -rf /`;
```

Then do that:

```typescript
await $`echo "goodbye"`;
```
````

### Shell blocks

Blocks that are marked as `shell` get turned into sequences of [ZX] shell
commands and executed respectively.

````markdown
# Setup instructions

First run this:

```shell
rm -rf
```

Then do that:

```shell
echo "goodbye"
```
````

### Writing files

To write arbitrary files, one can create a file block in any language and mark
it with `|-> [target-file]` to write the blocks content to that file.

````markdown
# Setup instructions

Create a configuration file:

```yaml
# |-> config.yml
foo: bar
```
````

### Environment variable interpolation

Environment variables are inherited to scripts and can be set within scripts by
writing to `process.env`. All variables will be inherited to sub-commands and
also interpolated into file blocks.

````markdown
# Project setup

Decide on a project name:

```typescript
process.env.PROJECT_NAME = 'my_project';
```

Create the directory:

```shell
mkdir $PROJECT_NAME
```

Create a config file;

```yaml
# |-> PROJECT_NAME/config.yml
title: 'PROJECT_NAME'
```
````

### Patching files

It is possible to include inline patches as code blocks that modify a given
file. To create one of these patches, prepare the old and new version of the
file and use the `mx diff` command and paste the output into a codeblock marked
with the `diff` language.

```shell
mx diff original.ts modified.ts | pbcopy
```

````markdown
```diff
Index: original.ts
===================================================================
--- original.ts
+++ original.ts
@@ -1,3 +1,4 @@
 const a = 'foo';
 const b = 'bar';
+const c = 'baz';
 console.log(a,b).
```
````

[zx]: https://github.com/google/zx
