# MXZ integration test

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

```typescript
// Ignore if the directory does not exist.
await $`rm -rf ${process.env.PROJECT_NAME}`.nothrow();
```

First we create a project directory.

```shell
mkdir $PROJECT_NAME
```

Then we switch the current working directory to there.

```typescript
cd(process.env.PROJECT_NAME);
```

We write a file.

```yaml title="./config.yml"
title: 'PROJECT_NAME'
token: ${{ github.token }}
```

```typescript title="./foo.ts"
const x = `PROJECT_${'NAME'}\n`;
```

Let's verify the file is there.

```typescript
const config = await $`cat config.yml`;
if (!/title/.test(config.stdout)) {
  await $`echo "Config file was not created."`;
  await $`exit 1`;
}
```

Create another file.

```text title="./PROJECT_NAME.txt"
"This is"
`some`
content.
```

And attempt to patch it:

```diff
Index: PROJECT_NAME.txt
===================================================================
--- PROJECT_NAME.txt
+++ PROJECT_NAME.txt
@@ -1,3 +1,4 @@
 "This is"
 `some`
+PROJECT_NAME
 content.
```

Verify that the files content has been patched.

```typescript
const patched = await $`cat ${process.env.PROJECT_NAME}.txt`;
if (
  patched.stdout !==
  '"This is"\n`some`\n' + process.env.PROJECT_NAME + '\ncontent.'
) {
  await $`echo "Text file was not patched."`;
  await $`exit 1`;
}
```

Create a `.yaml` file.

```typescript
file('test.yaml', (data) => ({
  foo: 'bar',
}));

const yaml = await $`cat test.yaml`;
if (!/foo: bar/.test(yaml.stdout)) {
  await $`echo "Yaml file was not created."`;
  await $`exit 1`;
}
```

Modify it:

```typescript
file('test.yaml', (data) => ({
  ...data,
  x: 'y',
}));

const yamlMod = await file('test.yaml');

if (!yamlMod.foo === 'bar' || !yamlMod.x === 'y') {
  await $`echo "Yaml file was not modified."`;
  await $`exit 1`;
}
```

Move back out:

```typescript
cd('../');
```

Delete the test directory.

```shell
rm -rf $PROJECT_NAME
```

And make sure its gone.

```typescript
if (await fs.exists(process.env.PROJECT_NAME)) {
  await $`echo "Test directory is still there."`;
  await $`exit 1`;
}
```

```shell
echo "All tests passed!"
```
