# MXZ integration test

```typescript
// Ignore if the directory does not exist.
$`rm -rf test`.nothrow();
```

```typescript
process.env.PROJECT_NAME = 'test_project';
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
const output = await $`cat config.yml`;
if (!/test_project/.test(output.stdout)) {
  await $`echo "Config file was not created."`;
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
