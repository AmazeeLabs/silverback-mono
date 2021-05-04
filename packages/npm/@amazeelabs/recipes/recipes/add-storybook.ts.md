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

### React

Add **React** and **React dom**, a JavaScript library for building user
interfaces

```typescript
// add react & react-dom
$$('yarn add react react-dom');
```

### Storybook

Add **Storybook**, an open source tool for developing UI components and pages in
isolation. It simplifies building, documenting, and testing UIs.

```typescript
// add npx
$$('yarn add npx');
// install & initialize Storybook
$$('npx sb init');
```

### Headless UI

Add **Headless UI**, Completely unstyled, fully accessible UI components,
designed to integrate beautifully with Tailwind CSS.

```typescript
// add headlessui/react
$$('yarn add @headlessui/react');
```

### Tailwind

Add **Tailwind**, a utility-first CSS framework packed with classes like flex,
pt-4, text-center and rotate-90 that can be composed to build any design,
directly in your markup.

```typescript
// install Tailwind
$$(
  'yarn add tailwindcss@npm:@tailwindcss/postcss7-compat postcss@^7 autoprefixer@^9',
);
```

Create postcss.config.js

```typescript
# |-> postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

Create **Tailwind** configuration file

```typescript
// install Tailwind
$$('npx tailwindcss init');
```

Create tailwind.css

```css
# |-> tailwind.css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update tailwind.config.js

```typescript
# |-> tailwind.config.js
module.exports = {
  purge: ['./src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
```

swith to .storybook folder

```typescript
$$.chdir(`.storybook`);
```

Update preview.js

```typescript
# |-> preview.js
import '../tailwind.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: {
      order: [
        'Pages',
        'Components',
        ['Atoms', 'Molecules', 'Organisms', 'Layouts'],
      ],
    },
  },
};
```
