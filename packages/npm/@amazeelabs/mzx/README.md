# MZX

_"Markdown ZX"_ - A wrapper around [ZX] that parses and interprets code blocks
in markdown files.

## Usage

```shell
npx @amazeelabs/mzx my-tutorial.md
```

## Writing scripts

MZX scripts can be regular markdown files. Any code blocks in the `typescript`
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

[zx]: https://github.com/google/zx
