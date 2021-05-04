# Add storybook UI and Tailwind

```typescript
// Check node version.
$$('node -v', {
  stdout: $$.minimalVersion('12'),
});

// Check yarn version.
$$('yarn -v', {
  stdout: $$.minimalVersion('1.0'),
});
```

## Project setup

Create a folders structure to contain the UI

```typescript
// Choose a project name.
const { projectName } = $$.prompts({
  type: 'text',
  name: 'projectName',
  message: 'What is the name of the project?',
  validate: (name) =>
    !/^[a-z][a-z\d_]+$/.test(name)
      ? 'Project names must start with a letter and contain lower case letters, numbers and underscores only.'
      : true,
});

$$(`mkdir -p packages/@${projectName}/ui`);
$$.chdir(`packages/@${projectName}/ui`);
```

Initialize the Ui project folder with yarn

```typescript
// yarn init
$$('yarn init -w -y');
```

Add **amazee scaffolding** in the package.json file, when the installation is
done we need to run **yarn amazee-scaffold** to install **Jest** and **esLint**

```typescript
// add & run @amazeelabs/scaffold
$$('yarn add @amazeelabs/scaffold');
$$('yarn amazee-scaffold');
```
