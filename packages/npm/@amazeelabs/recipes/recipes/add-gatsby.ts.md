# Create a Gatsby website

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

```typescript
$$('cat README.md', {
  stdout: /Executed `create-monorepo`/,
});

const { name: projectName } = $$.file('package.json');
```

Create a new Gatsby project from the [AmazeeLabs Gatsby starter] in
`apps/website`.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$('npx gatsby new website https://github.com/AmazeeLabs/gatsby-starter');
```

Switch into the newly created directory and attempt to build the website. This
should create a `index.html` file in the `public` folder with the starter kits
dummy content.

```typescript
$$.chdir('website');
$$('yarn build');
$$('cat public/index.html', {
  stdout: /Welcome to your new Gatsby site./,
});
```

The `.gitignore` file is not populated by the starter. The `public`,
`node_modules` and parts of the `generated` directory should not be part of the
repository.

```typescript
$$.file('.gitignore', (lines) => [
  'public',
  'node_modules',
  'generated',
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

Finally, commit the new app to the mono-repository.

```typescript
$$.chdir('../../');
$$('git add apps/website yarn.lock');
$$('git commit -m "chore: initiate Gatsby website app"');
```

Now the repository should be clean and you can start working on the new website
application.

```typescript
$$('git status --porcelain', {
  stdout: (output) =>
    output.trim().length !== 0
      ? `uncommitted changes:\n${output}\n`
      : undefined,
});
```
