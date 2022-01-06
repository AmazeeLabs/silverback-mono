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

Use `@amazeelabs/scaffold` to inject common development tooling like `jest`,
`eslint` or `prettier`.

```typescript
// add & run @amazeelabs/scaffold
$$('npx @amazeelabs/scaffold');
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
// |-> tailwind.config.js
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

### React Framework Bridge

We use `@amazeelabs/react-framework-bridge` to simulate framework dependencies
within our component library. We have to install it along with its peer
dependency `formik`.

```typescript
$$('yarn add @amazeelabs/react-framework-bridge');
$$('yarn add -D formik');
```

### Storybook

Storybook is used to develop and showcase user interface components in
isolation. We also employ [Chromatic](https://www.chromatic.com) to run visual
regression tests against Storybook. We can simply install it in our project by
running `npx sb init` which will automatically detect `React` and setup
everything correctly.

```typescript
// Install & initialize Storybook
$$('yarn global add @storybook/cli && yarn exec sb init'); // `npx sb init` replacement, reason: https://git.io/JSHCa
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
// |-> .storybook/main.js
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
// |-> .storybook/preview.js
import '../tailwind.css';
export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  options: {
    storySort: {
      order: [
        'Pages',
        'Components',
        ['Layouts', 'Organisms', 'Molecules', 'Atoms'],
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

## A first Organism

As the first and most common component, we will create a simple `Prose`
component that uses the
[typography](https://github.com/tailwindlabs/tailwindcss-typography) plugin for
Tailwind to nicely format arbitrary HTML content as we would receive it from a
WYSIWYG editor input field.

It will be a simple `div` element that wraps the content in the necessary
Tailwind classes. By default, we assume everything is an organism. So we create
a `components` folder within `src` and add an `organisms` folder in there.

```typescript
$$('mkdir -p src/components/organisms');
```

Now we can add the very simple `React` component. It applies the Tailwind
classes along with some margin based on the current screen size.

```tsx
// |-> src/components/organisms/Prose.tsx
import React from 'react';
import { Html } from '@amazeelabs/react-framework-bridge';

export const Prose = ({ Content }: { Content: Html }) => (
  <div className="prose sm:prose-lg md:prose-xl my-5 sm:my-10">
    <Content />
  </div>
);
```

Now we want to test and showcase our component under different circumstances.
That's what we create our story for. Each component can have multiple stories,
and we should use that to illustrate all edge cases.

```tsx
// |-> src/components/organisms/Prose.stories.tsx
import { Meta, Story } from '@storybook/react';
import React from 'react';
import { buildHtml } from '@amazeelabs/react-framework-bridge/storybook';

import { Prose } from './Prose';

export default {
  title: 'Components/Atoms/Prose',
  component: Prose,
} as Meta;

export const Text: Story = () => (
  <Prose
    Content={buildHtml(`
    <p>
      A simple text paragraph that is hopefully long enough, so it wraps the
      line at some point. It also contains <em>emphasized</em>,
      <strong>strongly emphasized</strong>
      and <a href="#">linked</a> words.
    </p>
  `)}
  />
);
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
    prepare: 'NODE_ENV=production yarn postcss tailwind.css -o styles.css',
  },
}));
```

We also have to declare our `main` and entry-points so consumers automatically
import the right files.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  main: './src/index.ts',
}));
```

Tell Typescript not to transpile anything.

```typescript
$$.file('tsconfig.json', (json) => ({
  ...json,
  compilerOptions: {
    ...json.compilerOptions,
    noEmit: true,
  },
}));
```

Should generate an importable stylesheet with all tailwind classes used in our
components.

```typescript
$$('yarn prepare');
$$('cat styles.css', {
  stdout: /prose/,
});
```

## Finishing up

Add build paths to `.gitignore`.

```gitignore
# >-> .gitignore
build-storybook.log
storybook-static
```

Commit everything.

```typescript
$$.chdir('../../..');
$$('yarn');
$$('git add .');
$$('git commit -m "chore: initialize storybook"');
```
