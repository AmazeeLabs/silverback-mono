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
$$(
  'yarn add -D tailwindcss postcss postcss-cli autoprefixer cssnano postcss-easy-import',
);
```

And we create a simple `PostCSS` configuration that enables `Tailwind`,
`Autoprefixer` for cross-browser compatibility, `postcss-easy-import` to be able
to use `@import` with `*` - wildcards in stylesheets as well as `cssnano` for
optimization.

```typescript
// |-> postcss.config.js
module.exports = {
  plugins: [
    require('postcss-easy-import'),
    require('tailwindcss'),
    require('autoprefixer'),
    require('cssnano'),
  ],
};
```

We also use a couple of Tailwind plugins. `@tailwindcss/typography` for styling
prose text content, `@tailwindcss/forms` for form elements,
`@tailwindcss/line-clamp` for multiline text truncation and
`@tailwindcss/aspect-ratio` to enable video embeds and iframes that adapt to the
screen size.

```typescript
$$('yarn add -D @tailwindcss/{typography,forms,aspect-ratio,line-clamp}');
```

In the Tailwind configuration file `tailwind.config.js` we declare the plugins
we use and configure the just-in-time compiler to look for classes used in
components within `src`.

```typescript
// |-> tailwind.config.js
module.exports = {
  content: ['./src/**/*.tsx'],
  theme: {
    // Most likely you have to define project specific colors here. If you
    // want the Tailwind color palette, remove this property.
    colors: {
      // Black, White and Transparent are ubiquitous. When defining other
      // colors, use the tailwind way of defining shades with numeric indices.
      black: '#000000',
      white: '#FFFFFF',
      transparent: 'transparent',
    },
  },
  extend: {
    // Add any modifications or overrides to the predefined tailwind classes.
  },
  plugins: [
    require('@tailwindcss/line-clamp'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
  ],
};
```

Now we can create a `tailwind.css` which will just import everything thats
necessary.

```css
/* |-> tailwind.css */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Import all atom stylesheets. */
/*noinspection CssUnknownTarget*/
@import 'src/elements/atoms/*.css';
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
dependencies `formik` and `react-intl`.

```typescript
$$('yarn add @amazeelabs/react-framework-bridge');
// Formik is installed in the application itself, so it's a dev dependency.
$$('yarn add -D formik');
// react-intl is used only from within the UI, so we add it to dependencies.
$$('yarn add react-intl');
```

To make `react-intl` without setting manual id's, we need its babel plugin and a
custom babel configuration that Storybook will pick up.

```typescript
$$(`yarn add -D babel-plugin-formatjs`);
```

```javascript
// |-> babel.config.js
module.exports = {
  plugins: [
    [
      'formatjs',
      {
        idInterpolationPattern: '[sha512:contenthash:base64:6]',
        ast: true,
      },
    ],
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
  ],
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript',
    '@babel/preset-react',
  ],
};
```

### Storybook

Storybook is used to develop and showcase user interface components in
isolation. We also employ [Chromatic](https://www.chromatic.com) to run visual
regression tests against Storybook. We can simply install it in our project by
running `npx sb init` which will automatically detect `React` and setup
everything correctly.

```typescript
// Install & initialize Storybook
// `npx sb init` replacement, reason: https://git.io/JSHCa
$$('yarn global add @storybook/cli && yarn exec sb init');
```

To use Tailwind within storybook, we need the `postcss` plugin.

```typescript
$$('yarn add -D @storybook/addon-postcss');
```

The A11y plugin gives immediate feedback about basic accessibility violations.

```typescript
$$('yarn add -D @storybook/addon-a11y');
```

The Interactions plugin allows to run automated tests within Storybook and
during CI/CD.

```typescript
$$('yarn add -D @storybook/addon-interactions');
```

Remove `config.js`, `addons.js` and `preview.js` files created by `sb init`. We
maintain both in `main.js`.

```typescript
$$('rm -f .storybook/config.js');
$$('rm -f .storybook/addons.js');
$$('rm -f .storybook/preview.js');
```

To be compatible to ESM packages, we need to build our stories with Webpack 5

```typescript
$$(
  'yarn add -D webpack@5 @storybook/builder-webpack5 @storybook/manager-webpack5',
);
```

Create a `.storybook/main.js` file that will tell storybook where to look for
stories and also which addons to load.

```javascript
// |-> .storybook/main.js
module.exports = {
  core: {
    // Use webpack 5 to be compatible to ESM packages.
    builder: 'webpack5',
  },
  features: {
    // Show the interactions debugger tab.
    interactionsDebugger: true,
    storyStoreV7: true,
  },
  staticDirs: ['../static'],
  stories: ['../src', '../docs'],
  addons: [
    '@storybook/addon-viewport',
    '@storybook/addon-a11y',
    '@storybook/addon-actions',
    '@storybook/addon-interactions',
    '@storybook/addon-toolbars',
    '@storybook/addon-docs',
    {
      name: '@storybook/addon-postcss',
      options: {
        postcssLoaderOptions: {
          // Specifically require postcss installed in the dependencies instead
          // of the builtin, outdated version.
          implementation: require('postcss'),
        },
      },
    },
  ],
  framework: '@storybook/react',
};
```

Since we assume that the `static` directory exists, we should also create it.

```typescript
$$('mkdir static');
$$('touch static/.gitkeep');
```

`.storybook/preview.ts` is used by Storybook to take control over stories
themselves. Here we include our Tailwind stylesheet and also some configuration
for automatically sorting stories based on
[Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) principles.

```css
/* |-> .storybook/storybook.css */
/* Make sure all wrapper elements are 100% height at least. */
html,
body,
#root,
#storybook-event-boundary {
  min-height: 100%;
}
```

```tsx
// |-> .storybook/preview.tsx

import '../tailwind.css';
import './storybook.css';
import { IntlProvider } from 'react-intl';
import React, { PropsWithChildren } from 'react';
import {
  ActionsDecorator,
  layoutArgsEnhancer,
  OrganismDecorator,
} from '@amazeelabs/react-framework-bridge/storybook';
import { DecoratorFn, ReactFramework, Story, StoryFn } from '@storybook/react';
export { argTypes } from '@amazeelabs/react-framework-bridge/storybook';

export const argsEnhancers = [
  // Automatically renders placeholders in layout stories.
  layoutArgsEnhancer,
];

export const parameters = {
  options: {
    storySort: {
      order: [
        'Pages',
        'Elements',
        ['Layouts', 'Organisms', 'Molecules', 'Atoms'],
      ],
    },
  },
  // Ignore every export that starts with "mock" in a stories-file. That way
  // mocking functions can be shared between stories.
  excludeStories: /^mock/,
  // Stories are not run chromatic by default. We selectively enable the ones we
  // want to run.
  chromatic: {
    disable: true,
  },
};

// Every story is wrapped in an IntlProvider by default.
const IntlDecorator: DecoratorFn = (Story) => (
  <IntlProvider locale={'en'} defaultLocale={'en'}>
    <Story />
  </IntlProvider>
);

export const decorators: Array<DecoratorFn> = [
  OrganismDecorator,
  ActionsDecorator,
  IntlDecorator,
];
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
$$('mkdir -p src/elements/organisms');
```

Now we can add the very simple `React` component. It applies the Tailwind
classes along with some margin based on the current screen size.

```tsx
// |-> src/elements/organisms/Prose.tsx
import React from 'react';
import { Html, OrganismProps } from '@amazeelabs/react-framework-bridge';

export default function Prose({
  Content,
}: OrganismProps<{
  Content: Html;
}>) {
  return (
    <div className="prose sm:prose-lg md:prose-xl my-5 sm:my-10">
      <Content />
    </div>
  );
}
```

Now we want to test and showcase our component under different circumstances.
That's what we create our story for. Each component can have multiple stories,
and we should use that to illustrate all edge cases.

```tsx
// |-> src/elements/organisms/Prose.stories.ts
import { Meta } from '@storybook/react';
import {
  buildHtml,
  OrganismStory,
} from '@amazeelabs/react-framework-bridge/storybook';
import { within } from '@storybook/testing-library';

import Prose from './Prose';

export default {
  component: Prose,
} as Meta;

export const ExampleProse: OrganismStory<typeof Prose> = {
  args: {
    Content: buildHtml(`
    <p>
      A simple text paragraph that is hopefully long enough, so it wraps the
      line at some point. It also contains <em>emphasized</em>,
      <strong>strongly emphasized</strong>
      and <a href="#">linked</a> words.
    </p>
  `),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText(/a simple text paragraph/i);
  },
};
```

## Putting the organism into action

Organisms are placed into layouts to create routes, which in turn form pages. So
we first create a "Page" layout that will cover everything our pages have in
common. Layouts go into the "elements/layouts" folder.

```typescript
$$('mkdir -p src/elements/layouts');
```

```tsx
// |-> src/elements/layouts/Page.tsx
import React from 'react';
import { LayoutProps } from '@amazeelabs/react-framework-bridge';
import { useIntl } from 'react-intl';

export default function Page(props: LayoutProps<'header' | 'footer'>) {
  const intl = useIntl();
  return (
    <div className="flex flex-col h-full">
      <a
        tabIndex={1}
        href="#main-content"
        className={
          'sr-only fixed top-0 left-1/2 z-50 -translate-x-1/2 rounded-b-md focus:not-sr-only focus:inline-block'
        }
      >
        {intl.formatMessage({ defaultMessage: 'Skip to content' })}
      </a>
      <header>{props.header}</header>
      <main id="main-content" className="flex-1">
        {props.children}
      </main>
      <footer>{props.footer}</footer>
    </div>
  );
}
```

```typescript
// |-> src/elements/layouts/Page.stories.ts
import Page from './Page';
import { Meta } from '@storybook/react';
import { LayoutStory } from '@amazeelabs/react-framework-bridge/storybook';

export default {
  component: Page,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const ExamplePage: LayoutStory<typeof Page> = {
  name: 'Page',
  args: {
    header: ['Header', 'yellow', 200],
    children: ['Content', 'green'],
    footer: ['Footer', 'purple', 400],
  },
};
```

Our standard layout declares two "slots": `header` and `footer`. To create a
route, we need organisms to put into these.

```tsx
// |-> src/elements/organisms/Header.tsx
import React from 'react';

export default function Header() {
  return <h1>My page header!</h1>;
}
```

```tsx
// |-> src/elements/organisms/Header.stories.ts
import { Meta } from '@storybook/react';
import { OrganismStory } from '@amazeelabs/react-framework-bridge/storybook';

import Header from './Header';

export default {
  component: Header,
} as Meta;

export const ExampleHeader: OrganismStory<typeof Header> = { args: {} };
```

```tsx
// |-> src/elements/organisms/Footer.tsx
import React from 'react';

export default function Footer() {
  return <h1>My page footer!</h1>;
}
```

```tsx
// |-> src/elements/organisms/Footer.stories.ts
import { Meta } from '@storybook/react';
import { OrganismStory } from '@amazeelabs/react-framework-bridge/storybook';

import Footer from './Footer';

export default {
  component: Footer,
} as Meta;

export const ExampleFooter: OrganismStory<typeof Footer> = { args: {} };
```

We will need a second layout that is used for the actual page content. This way
we will be able to wrap different content layouts with the same header and
footer configuration.

```tsx
// |-> src/elements/layouts/Content.tsx
import React from 'react';
import { LayoutProps } from '@amazeelabs/react-framework-bridge';

export default function Content(props: LayoutProps<'body'>) {
  return <div>{props.body}</div>;
}
```

```typescript
// |-> src/elements/layouts/Content.stories.ts
import Content from './Content';
import { Meta } from '@storybook/react';
import { LayoutStory } from '@amazeelabs/react-framework-bridge/storybook';

export default {
  component: Content,
} as Meta;

export const ExampleContent: LayoutStory<typeof Content> = {
  name: 'Page',
  args: {
    body: ['Body', 'green'],
  },
};
```

Now we are ready to declare our routes, by combining layouts with organisms.

```typescript
// |-> src/routes.ts
import { route } from '@amazeelabs/react-framework-bridge';
import Page from './elements/layouts/Page';
import Content from './elements/layouts/Content';
import Header from './elements/organisms/Header';
import Footer from './elements/organisms/Footer';
import Prose from './elements/organisms/Prose';

export const PageRoute = route(Page, {
  header: Header,
  footer: Footer,
});

export const ContentRoute = route(Content, {
  body: {
    prose: Prose,
  },
});
```

Now we can showcase the assembled pages in Storybook by defining stories for
them. Just like routes, these stories can be nested.

```typescript
// |-> src/pages.stories.ts
import { Meta } from '@storybook/react';
import {
  renderRouteStory,
  RouteStory,
} from '@amazeelabs/react-framework-bridge/storybook';
import { PageRoute, ContentRoute } from './routes';
import { ExampleHeader } from './elements/organisms/Header.stories';
import { ExampleFooter } from './elements/organisms/Footer.stories';
import { ExampleProse } from './elements/organisms/Prose.stories';

export default {
  title: 'Pages',
  parameters: {
    layout: 'fullscreen',
    // Chromatic is enabled for pages and runs on 3 different viewports.
    chromatic: {
      disable: false,
      viewports: [420, 840, 1440],
    },
  },
} as Meta;

// The Page story is not rendered itself, but used for nesting other stories in.
const Page: RouteStory<typeof PageRoute> = {
  render: renderRouteStory(PageRoute),
  args: {
    header: ExampleHeader,
    footer: ExampleFooter,
  },
};

export const ContentPage: RouteStory<typeof ContentRoute> = {
  render: renderRouteStory(ContentRoute, Page),
  args: {
    body: [
      {
        key: 'prose',
        story: ExampleProse,
      },
    ],
  },
};
```

## Storybook integration tests

The `@storybook/testing` package allows us to run all stories and play functions
from the command line and continuous integration workflow. First we need a
couple of packages:

- `@storybook/jest`: Provides jest-based functionality that is used in play
  functions.
- `@storybook/testing-library`: Testing library bindings to be used in play
  functions.
- `@storybook/testing-react`: React testing utilities.
- `@storybook/test-runner`: The actual CLI test runner.

```typescript
$$('yarn add -D @storybook/{jest,testing-library,testing-react,test-runner}');
```

To be able to run tests on virtual devices of multiple sizes, we have to
override the test runner's jest configuration.

```javascript
// |-> test-runner-jest.config.js
const { getJestConfig } = require('@storybook/test-runner');

module.exports = {
  // The default configuration comes from @storybook/test-runner
  ...getJestConfig(),
  /** Add your own overrides below
   * @see https://jestjs.io/docs/configuration
   */
  testEnvironmentOptions: {
    'jest-playwright': {
      devices: process.env.TEST_DEVICE === 'mobile' ? ['iPhone 8'] : undefined,
    },
  },
};
```

Now we add the integration test scripts as _integration_ tests to
`package.json`. They also need some helper packages to run.

```typescript
$$(`yarn add -D serve start-server-and-test`);
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'serve-storybook': 'serve storybook-static',
    'test:integration':
      'yarn build-storybook && start-test serve-storybook :3000 test-storybook',
    'test-storybook':
      'yarn test-storybook:desktop && yarn test-storybook:mobile',
    'test-storybook:desktop': 'test-storybook --url http://localhost:3000',
    'test-storybook:mobile':
      'TEST_DEVICE=mobile test-storybook --url http://localhost:3000',
  },
}));
```

Now the integration test suite should pass.

```typescript
$$('yarn test:integration');
```

## Build and export

To use our UI library in another package, we have to use the `prepare` hook to
create importable sources. This will include three steps:

1. Building the CSS stylesheet from Tailwind, so it can be imported in an
   application without requiring Tailwind itself or PostCSS
2. Extracting and bundling type definitions so the consumer can reap the
   benefits of type checking.
3. Bundling the UI components as ES modules **and** Commonjs packages to make
   sure the library can be ingested by all the build systems out there.

### Styles

The first one is easy. We just add a script that runs PostCSS on our stylesheet
and output the result to `styles.css` .

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'prepare:styles':
      'NODE_ENV=production yarn postcss tailwind.css -o styles.css',
  },
}));
```

Running this command should create a stylesheet that contains for example the
`prose` class we used in our organism before.

```typescript
$$('yarn prepare:styles');
$$('cat styles.css', {
  stdout: /prose/,
});
```

### Types

To make Typescript emit type declarations we have to tell it to do so in the
`tsconfig.json`.

```typescript
$$.file('tsconfig.json', (json) => {
  // Remove the noEmit flag.
  const { noEmit, ...compilerOptions } = json.compilerOptions;
  return {
    ...json,
    compilerOptions: {
      ...compilerOptions,
      declaration: true,
      declarationDir: 'dts',
    },
  };
});
```

We add a npm script that invokes the transpiler with only declarations as an
output. Running this command will output type definitions into the `dts`
directory.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'prepare:types': 'tsc --emitDeclarationOnly',
  },
}));
```

### Bundling

Eventually, we have to bundle up all the transpiled assets. We use `rollup` in
combination with a couple of plugins to do so.

```typescript
$$(
  'yarn add -D rollup @rollup/{plugin-babel,plugin-json,plugin-node-resolve} rollup-plugin-dts',
);
```

After installing the plugins, we have to add a `rollup.config.js` configuration
file that contains the bundling instructions.

```javascript
// |-> rollup.config.js
import babel from '@rollup/plugin-babel';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'build/cjs',
        format: 'cjs',
      },
      {
        dir: 'build/esm',
        format: 'es',
      },
    ],
    external: (id) => {
      return !/^(\.\/|\.\.\/|\/)/.test(id);
    },
    plugins: [
      resolve({ extensions: ['.ts', '.tsx'] }),
      babel({
        extensions: ['.ts', '.tsx'],
        babelHelpers: 'bundled',
        include: ['src/**/*'],
      }),
      json(),
    ],
  },
  {
    input: 'dts/index.d.ts',
    output: [{ file: 'build/index.d.ts' }],
    plugins: [dts()],
  },
];
```

This references an `index.ts` file that does not exist. Let's create it. For
now, it will simply export all routes that where defined in `routes.ts`, but we
might add more exports in the future.

```typescript
// |-> src/index.ts
export * from './routes';
```

We add another script that will execute this rollup configuration:

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    'prepare:bundle': 'rollup -c rollup.config.js',
  },
}));
```

Now we combine all these three in a single `prepare` step that is run before the
package is distributed.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    prepare: 'yarn prepare:styles && yarn prepare:types && yarn prepare:bundle',
  },
}));
```

To help build tools to find the right asset, we have to declare them in our
`package.json`:

```typescript
$$.file('package.json', (json) => ({
  ...json,
  main: './build/cjs/index.js',
  module: './build/esm/index.js',
  types: './build/index.d.ts',
}));
```

And to make our package as slim as possible, we add a `.npmignore` file. This is
also necessary because npm will by default ignore everything that is listed in
`.gitignore`, which is the opposite of what we want, because we specifically
intend to distribute the newly built contents of the `build` folder.

```gitignore
# >-> .gitignore
node_modules
src
.storybook
storybook-static
dts
```

To finish up, we can run the `yarn prepare` command to verify it works.

```typescript
$$('yarn prepare');
```

## Developer tooling

Tailwind and FormatJS come with `eslint` and `prettier` plugins that we would
like to use.

```typescript
$$(
  `yarn add -D eslint-plugin-tailwindcss eslint-plugin-formatjs prettier-plugin-tailwindcss eslint-plugin-storybook`,
);
```

```javascript
// |-> .eslintrc.js
module.exports = {
  plugins: ['formatjs', 'tailwindcss'],
  extends: [
    '@amazeelabs/eslint-config',
    'plugin:storybook/recommended',
    'plugin:tailwindcss/recommended',
  ],
  rules: {
    'formatjs/enforce-default-message': 'error',
    'formatjs/no-id': 'error',
    'formatjs/enforce-placeholders': 'error',
    'formatjs/no-camel-case': 'error',
    'tailwindcss/classnames-order': [0],
  },
  root: true,
};
```

```javascript
// |-> .prettierrc.js
const common = require('@amazeelabs/prettier-config');
module.exports = {
  ...common,
  plugins: [...(common.plugins || []), require('prettier-plugin-tailwindcss')],
};
```

## Libraries

Let's add some general purpose libraries that we will very likely used within
that UI package.

```typescript
$$(
  'yarn add @headlessui/react @heroicons/react lodash swiper lottie-react clsx react-datepicker',
);
```

## Chromatic

We use [Chromatic](https://www.chromatic.com) for visual reviews and regression
testing. To push any changes to chromatic automatically, add this Github
workflow:

```typescript
$$.vars({
  projectName,
});
```

```yaml
# |-> ../../../.github/workflows/chromatic.yml
# .github/workflows/chromatic.yml

# Workflow name
name: 'Chromatic'

# Event for the workflow
on:
  push:
    branches:
      - dev
  pull_request:
    branches:
      - dev

# List of jobs
jobs:
  chromatic-deployment:
    # Operating System
    runs-on: ubuntu-latest
    # Job steps
    steps:
      - name: Tell yarn to use bash
        run: yarn config set script-shell /bin/bash
      - name: Checkout repository
        uses: actions/checkout@v2
        with:
          fetch-depth: 0
      - name: Install dependencies
        run: yarn
        # 👇 Adds Chromatic as a step in the workflow
      - name: Build & test storybook
        run: yarn workspace @{{projectName}}/ui run test

      - name: Publish to Chromatic
        uses: chromaui/action@v1
        # Chromatic GitHub Action options
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          # 👇 Chromatic projectToken, refer to the manage page to obtain it.
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          storybookBuildDir: packages/@{{projectName}}/ui/storybook-static
```

After that you still have to create a project on Chromatic, get its token and
add it as a secret named `CHROMATIC_PROJECT_TOKEN` to the Github repository
settings.

## Finishing up

Add build paths to `.gitignore`.

```gitignore
# >-> .gitignore
build-storybook.log
storybook-static
node_modules
coverage
build
styles.css
storybook-static
dts
```

Commit everything.

```typescript
$$.chdir('../../..');
$$('yarn');
$$('git add .');
$$('git commit -m "chore: initialize storybook"');
```
