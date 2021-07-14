# Add storybook UI and Tailwind

This recipe will create the necessary structure and configuration to be able to
use storybook with the latest tailwind version.

## Project setup

This recipe has to be run from the root folder of a mono-repository created with
`amazee-recipes create-monorepo`.

```typescript
// Pick project name from package.json.
const { name: projectName } = $$.file('package.json');
```

Create a folders structure to contain the UI

```typescript
$$(`mkdir -p packages/@${projectName}/ui`);
$$.chdir(`packages/@${projectName}/ui`);
```

Initialize the Ui project folder with yarn

```typescript
// yarn init
$$('yarn init -y -p');
```

Add the project namespace

```typescript
// add the project namespace
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/ui`,
  description: `Design system for ${projectName.toUpperCase()}`,
}));
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
// install @storybook/addon-postcss
$$('yarn add @storybook/addon-postcss');
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
$$('yarn add tailwindcss postcss postcss-cli autoprefixer');
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
/* |-> tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Update tailwind.config.js

```typescript
# |-> tailwind.config.js
module.exports = {
  mode: 'jit',
  purge: ['./src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {},
  },
  variants: {},
  plugins: [],
};
```

Remove `config.js` and `addons.js` files created by `sb init`. We maintain both
in `main.js`.

```typescript
$$('rm .storybook/config.js');
$$('rm .storybook/addons.js');
```

Update main.js

```typescript
# |-> .storybook/main.js
module.exports = {
  stories: [
    '../src/components/**/*.stories.mdx',
    '../src/components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          implementation: require('postcss'),
        },
      },
    },
  ],
};
```

Update preview.js

```typescript
# |-> .storybook/preview.js
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

## Stories creation

Delete default storybook stories

```typescript
$$('rm -fr stories');
```

Create layout sample

```typescript
$$('mkdir -p src/components/layouts/__stories__');
```

```tsx
# |-> src/components/layouts/StandardLayout.tsx
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{}>;

export const StandardLayout = ({ children }: Props) => (
  <div className="max-w-7xl mx-auto">
    <header className="text-4xl p-4 bg-blue-50">Header</header>
    <main className="p-4 prose">{children}</main>
    <footer className="p-4 text-xs bg-blue-900 text-white">Footer</footer>
  </div>
);
```

```tsx
# |-> src/components/layouts/__stories__/StandardLayout.stories.tsx
import { Meta, Story } from '@storybook/react';
import React from 'react';

import { StandardLayout } from '../StandardLayout';

export default {
  title: 'Components/Layouts/Standard',
  component: StandardLayout,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Standard: Story = () => (
  <StandardLayout>
    <div className="border-2 border-gray-300 border-solid h-24" />
  </StandardLayout>
);
```

We add an `index.ts` file to the `layouts` directory that just exports our
component.

```typescript
# |-> src/components/layouts/index.ts
export { StandardLayout } from './StandardLayout';
```

And another one in the top level `src` directory that just re-exports everything
within the `components` folder. The library consumer will then be able to simply
import components by just using the package name
(`import { StandardLayout } from '@${projectName}/ui';`).

```typescript
# |-> src/index.ts
export * from './components/layouts';
```

## Build and export

Build Storybook to verify everything works as expected.

```typescript
$$('yarn build-storybook');
```

To use our UI library in another package, we have to use the `prepare` hook to
create importable sources. We keep the `amazee-scaffold` command and add `tsc`
to transpile our components to pure javascript and generate type definitions
while also running `postcss` to produce a production version of the tailwind
classes used by our components.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    prepare:
      'amazee-scaffold && yarn tsc && NODE_ENV=production yarn postcss tailwind.css -o styles.css',
  },
}));
```

We also have to declare our `main` and `types` entry-points so consumers
automatically import the built assets.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  main: './dist/index.js',
  types: './dist/index.d.ts',
}));
```

Tell Typescript to transpile the source files in `src` to the `dist` folder and
put the latter onto `git`'s ignore list.

```typescript
$$.file('tsconfig.json', (json) => ({
  ...json,
  compilerOptions: {
    ...json.compilerOptions,
    outDir: 'dist',
    rootDir: 'src',
    declaration: true,
  },
}));
$$.file('.gitignore', (lines) => ['dist', ...lines]);
```

Should generate an importable stylesheet with all tailwind classes used in our
components and also the transpiled javascript sources.

```typescript
$$('yarn prepare');
$$('cat styles.css', {
  stdout: /border-gray-300/,
});
$$('test -f dist/index.js');
$$('test -f dist/index.d.ts');
```
