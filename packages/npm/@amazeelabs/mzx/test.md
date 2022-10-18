# MXZ integration test

```typescript
process.env.PROJECT_NAME = 'test_project';
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

```yaml
# |-> config.yml
title: 'PROJECT_NAME'
```

Let's verify the file is there.

```typescript
const config = await $`cat config.yml`;
if (!/test_project/.test(config.stdout)) {
  await $`echo "Config file was not created."`;
  await $`exit 1`;
}
```

Create another file.

```text
|-> PROJECT_NAME.txt
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
