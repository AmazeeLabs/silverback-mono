# Create a Gatsby website

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

```typescript
$$('cat README.md', {
  assert: { stdout: /Executed `create-monorepo`/ },
});

const { name: projectName } = $$.file('package.json');
```

## Init Gatsby

Create a new Gatsby project in `apps/website`.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('yarn create gatsby website -y -ts', {
  // We need to give it interactive IO, even if it does not ask questions.
  // Otherwise, it fails with "TypeError: qi.cursorTo is not a function"
  stdio: 'inherit',
});
```

Make it a part of the monorepo.

```typescript
$$.chdir('website');
$$('rm -rf .git');
$$('rm -rf node_modules');
$$('rm package-lock.json');
```

Commit.

```typescript
$$('git add .');
$$('git commit -m "chore: init gatsby"');
```

## Scaffold it

```typescript
$$('npx @amazeelabs/scaffold');
$$('git add .');
$$('git commit -m "chore: scaffold gatsby"');
$$('exit 1');
```

Switch into the newly created directory and attempt to build the website. This
should create a `index.html` file in the `public` folder with the starter kits
dummy content.

We run `yarn update-schema` instead of `yarn build` to build Gatsby and export
its GraphQL schema in one shot.

```typescript
$$.chdir('website');
$$('yarn update-schema');
$$('cat public/index.html', {
  assert: { stdout: /Welcome to your new Gatsby site./ },
});

$$('git add generated');
$$('git commit -m "chore: export gatsby schema"');
```

Exclude generated code from Git.

```typescript
$$.file('.gitignore', (lines) => [
  'generated/*',
  '!generated/schema.graphql',
  ...lines,
]);
```

The tests and typechecking should pass.

```typescript
$$('yarn test');
```

We can adjust the package name and description to match the current project.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/website`,
  description: `Gatsby website for ${projectName.toUpperCase()}`,
}));
```

Re-run `yarn install` on the root level to update `yarn.lock`.

```typescript
$$.chdir('../../');
$$('yarn');
```

Finally, commit the new app to the mono-repository.

```typescript
$$('git add apps/website yarn.lock');
$$('git commit -m "chore: initiate Gatsby website app"');
```
