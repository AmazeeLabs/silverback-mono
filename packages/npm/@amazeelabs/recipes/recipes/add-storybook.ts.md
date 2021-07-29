# Add storybook UI and Tailwind

This recipe will create the necessary structure and configuration to be able to
use Storybook with the latest Tailwind version.

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

```typescript
$$('cat README.md', {
  stdout: /Executed `create-monorepo`/,
});

const { name: projectName } = $$.file('package.json');
```

## Package setup

Create a new package called `ui` within our projects namespace and make it the
active directory for now.

```typescript
$$(`mkdir -p packages/@${projectName}/ui`);
$$.chdir(`packages/@${projectName}/ui`);
```

Run `yarn init -y -p` to create a new `package.json` file.

```typescript
// yarn init
$$('yarn init -y -p');
```

Set the correct name and description.

```typescript
// add the project namespace
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/ui`,
  description: `Design system for ${projectName.toUpperCase()}`,
}));
```

Add `@amazeelabs/scaffold` to inject common development tooling like `jest`,
`eslint` or `prettier`. After installation, we have to run
`yarn amazee-scaffold` to install the `prepare` hook that will keep these tools
automatically up-to-date.

```typescript
// add & run @amazeelabs/scaffold
$$('yarn add @amazeelabs/scaffold');
$$('yarn amazee-scaffold');
```

### React

We build user interfaces with `React`, so we add `react` and `react-dom` as our
first dependencies.

```typescript
// add react & react-dom
$$('yarn add react react-dom');
```

### Tailwind & Headless UI

For styling we rely on the utility-first CSS framework
[Tailwind](https://tailwindcss.com/), which is run within
[PostCSS](https://postcss.org/). First we add the necessary packages.
```typescript
// install Tailwind
$$('yarn add -D tailwindcss postcss postcss-cli autoprefixer');
```

And we create a simple `PostCSS` configuration that actives `Tailwind` and
`Autoprefixer` for cross-browser compatibility.

```typescript
# |-> postcss.config.js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

We also use a couple of Tailwind plugins. `@tailwindcss/typography` for styling
prose text content, `@tailwindcss/forms` for form elements and
`@tailwindcss/aspect-ratio` to enable video embeds and iframes that adapt to the
screen size.

```typescript
$$('yarn add -D @tailwindcss/{typography,forms,aspect-ratio}');
```

Now we can create a `tailwind.css` which will just import everything thats
necessary.

```css
/* |-> tailwind.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

In the Tailwind configuration file `tailwind.config.js` we declare the plugins
we use and configure the just-in-time compiler to look for classes used in
components within `src`.

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
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
```

The [Headless UI](https://headlessui.dev/) library provides accessible
interactive elements that can be fully styled using Tailwind classes. We also
add the to our toolbox for later.

```typescript
$$('yarn add @headlessui/react');
```

### Storybook

Storybook is used to develop and showcase user interface components in
isolation. We also employ [Chromatic](https://www.chromatic.com) to run visual
regression tests against Storybook. We can simply install it in our project by
running `npx sb init` which will automatically detect `React` and setup
everything correctly.

```typescript
// Install & initialize Storybook
$$('npx sb init');
// Install @storybook/addon-postcss to include Tailwind styles.
$$('yarn add -D @storybook/addon-postcss');
```

Remove `config.js` and `addons.js` files created by `sb init`. We maintain both
in `main.js`.

```typescript
$$('rm -f .storybook/config.js');
$$('rm -f .storybook/addons.js');
```

Create a `.storybook/main.js` file that will tell storybook where to look for
stories and also which addons to load.

```javascript
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

`.storybook/preview.js` is used by Storybook to take control over stories
themselves. Here we include our Tailwind stylesheet and also some configuration
for automatically sorting stories based on
[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) principles.

```javascript
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

Storybook setup has created some example stories that we won't need, so we
delete them.

```typescript
$$('rm -fr stories');
```

## A first component with a story

As the first and most common component, we will create a simple `Prose`
component that uses the
[typography](https://github.com/tailwindlabs/tailwindcss-typography) plugin for
Tailwind to nicely format arbitrary HTML content as we would receive it from a
WYSIWYG editor input field.

It will be a simple `div` element that wraps the content in the necessary
Tailwind classes. It does not use any other components, and it does not consume
data directly, which classifies it as an "Atom". So we create a `components`
folder within `source` and add an `atoms` folder in there.

```typescript
$$('mkdir -p src/components/atoms');
```

Now we can add the very simple `React` component. It applies the Tailwind
classes along with some margin based on the current screen size.

```tsx
# |-> src/components/atoms/Prose.tsx
import React, { PropsWithChildren } from 'react';

export const Prose = ({ children }: PropsWithChildren<{}>) => (
  <div className="prose sm:prose-lg md:prose-xl my-5 sm:my-10">
    {children}
  </div>
);
```

Now we want to test and showcase our component under different circumstances.
That's what we create our story for. Each component can have multiple stories,
and we should use that to illustrate all edge cases.

To not pollute the `atoms` directory, we create a `__stories__` folder within it
that will contain our story.

```typescript
$$('mkdir -p src/components/atoms/__stories__');
```

```tsx
# |-> src/components/atoms/__stories__/Prose.stories.tsx
import { Meta, Story } from '@storybook/react';
import React from 'react';

import { Prose } from '../Prose';

export default {
  title: 'Components/Atoms/Prose',
  component: Prose,
} as Meta;

export const Text: Story = () => (
  <Prose>
    <p>
      A simple text paragraph that is hopefully long enough,
      so it wraps the line at some point.
      It also contains <em>emphasized</em>,
      <strong>strongly emphasized</strong>
      and <a href="#">linked</a> words.
    </p>
  </Prose>
);

export const Headlines: Story = () => (
    <Prose>
      <h1>Headline level 1</h1>
      <h2>Headline level 2</h2>
      <h3>Headline level 3</h3>
      <h4>Headline level 4</h4>
      <h5>Headline level 5</h5>
      <h6>Headline level 6</h6>
    </Prose>
);

export const Lists: Story = () => (
    <Prose>
      <ul>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ul>
      <ol>
        <li>Item 1</li>
        <li>Item 2</li>
        <li>Item 3</li>
      </ol>
    </Prose>
);
```

We add an `index.ts` file to the `atoms` directory that just exports our
component.

```typescript
# |-> src/components/atoms/index.ts
export { Prose } from './Prose';
```

Another one in the top level `src` directory that just re-exports everything
within the `components` folder. The library consumer will then be able to simply
import components by just using the package name
(`import { Prose } from '@${projectName}/ui';`).

```typescript
# |-> src/index.ts
export * from './components/atoms';
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
  stdout: /prose/,
});
$$('test -f dist/index.js');
$$('test -f dist/index.d.ts');
```
