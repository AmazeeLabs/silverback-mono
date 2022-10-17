# MXZ integration test

```typescript
// Ignore if the directory does not exist.
$`rm -rf test`.nothrow();
```

First we create a test directory.

```shell
mkdir test
```

Then we switch the current working directory to there.

```typescript
cd('test');
```

We write a file.

```yaml
# |-> config.yml
Foobar!
```

Let's verify the file is there.

```typescript
const output = await $`cat config.yml`;
if (!/Foobar/.test(output.stdout)) {
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
rm -rf test
```

And make sure its gone.

```typescript
if (await fs.exists('test')) {
  await $`echo "Test directory is still there."`;
  await $`exit 1`;
}
```

```shell
echo "All tests passed!"
```
