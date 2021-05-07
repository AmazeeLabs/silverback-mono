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
$$(`mkdir -p packages/${projectName}/ui`);
$$.chdir(`packages/${projectName}/ui`);
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
  name: `${projectName}-ui`,
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
// install @storybook/addon-postcss and @storybook/builder-webpack5
$$('yarn add @storybook/addon-postcss @storybook/builder-webpack5');
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
$$('yarn add tailwindcss@latest postcss@latest autoprefixer@latest');
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

Update main.js

```typescript
# |-> main.js
module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
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
  core: {
    builder: 'webpack5',
  },
};
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

## Stories creation

Delete default storybook stories

```typescript
$$.chdir(`../`);
$$('rm -fr stories/');
$$(`mkdir -p stories/assets`);
$$.chdir(`stories`);
```

Create layout sample

```typescript
$$(`mkdir -p layouts`);
$$.chdir(`layouts`);
```

```typescript
# |-> StandardLayout.tsx
import React, {PropsWithChildren} from 'react';

type Props = PropsWithChildren<{}>;

export const StandardLayout = ({ children }: Props) => (
  <div className="max-w-7xl mx-auto">
    <header className="text-4xl p-4 bg-blue-50">Header</header>
    <main className="p-4 prose">{children}</main>
    <footer className="p-4 text-xs bg-blue-900 text-white">Footer</footer>
  </div>
);
```

```typescript
# |-> StandardLayout.stories.tsx
import { Meta, Story } from '@storybook/react';
import React from 'react';

import { StandardLayout } from './StandardLayout';

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
