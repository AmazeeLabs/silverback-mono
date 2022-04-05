# Create a Gatsby website

> This recipe has to be run from the root folder of a mono-repository created
> with `amazee-recipes create-monorepo`.

```typescript
$$('cat README.md', {
  stdout: /Executed `create-monorepo`/,
});

const { name: projectName } = $$.file('package.json');
```

## Init Gatsby

Create a new Gatsby project in `apps/website`.

```typescript
$$('mkdir -p apps');
$$.chdir('apps');
$$(
  'npx gatsby new website https://github.com/gatsbyjs/gatsby-starter-minimal-ts',
);
```

Make it a part of the monorepo.

```typescript
$$.chdir('website');
$$('rm -rf .git');
$$('rm -rf node_modules');
$$('rm -f package-lock.json README.md LICENSE');
```

We can adjust the package name and description to match the current project.

```typescript
$$.file('package.json', (json) => ({
  ...json,
  name: `@${projectName}/website`,
  description: `Gatsby website for ${projectName.toUpperCase()}`,
}));
```

Adjust index and 404 pages.

```tsx
// |-> src/pages/index.tsx

import { graphql, PageProps } from 'gatsby';
import * as React from 'react';

export const query = graphql`
  query HomePageQuery {
    site {
      siteMetadata {
        siteUrl
      }
    }
  }
`;

const IndexPage = ({ data }: PageProps<HomePageQueryQuery>) => {
  return (
    <main>
      <title>Home Page</title>
      <h1>Congratulations — you just made a Gatsby site! 🎉🎉🎉</h1>
      <p>
        Edit <code>src/pages/index.tsx</code> to see this page update in
        real-time. 😎
      </p>
      <p>
        And please edit <code>siteUrl</code> in <code>gatsby-config.ts</code>.
        Currently it is <code>{data.site?.siteMetadata?.siteUrl}</code>
      </p>
    </main>
  );
};

export default IndexPage;
```

```tsx
// |-> src/pages/404.tsx

import * as React from 'react';

const NotFoundPage = () => {
  return (
    <main>
      <title>Not found</title>
      <h1>Page not found</h1>
    </main>
  );
};

export default NotFoundPage;
```

Commit.

```typescript
$$('git add .');
$$('git commit -m "chore: init gatsby"');
```

## Scaffold it

```typescript
$$('npx @amazeelabs/scaffold');
```

Re-run `yarn install` on the root level to update `yarn.lock`.

```typescript
$$.chdir('../..');
$$('yarn install');
```

Commit.

```typescript
$$('yarn prettier ./apps/website --write');
$$('git add .');
$$('git commit -m "chore: scaffold gatsby"');
```

## Basic plugins & codegen

```typescript
$$.chdir('apps/website');
const runtimeDeps = [
  'gatsby-plugin-image',
  'gatsby-plugin-manifest',
  'gatsby-plugin-netlify',
  'react-helmet',
  'gatsby-plugin-react-helmet',
  'gatsby-plugin-schema-export',
  'gatsby-plugin-sharp',
  'gatsby-source-filesystem',
  'gatsby-transformer-sharp',
];
$$(`yarn add ${runtimeDeps.join(' ')}`);
const devDeps = [
  '@graphql-codegen/cli',
  '@graphql-codegen/typescript',
  '@graphql-codegen/typescript-operations',
];
$$(`yarn add --dev ${devDeps.join(' ')}`);
$$.chdir('../..');
$$('yarn install');

$$.chdir('apps/website');

$$.file('gatsby-config.ts', (lines: Array<string>) => {
  const index = lines.findIndex((line) => line.includes('plugins: [],'));
  const plugins = [
    'gatsby-plugin-image',
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        icon: 'src/images/icon.png',
      },
    },
    'gatsby-plugin-sharp',
    'gatsby-transformer-sharp',
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: './src/images/',
      },
    },
    'gatsby-plugin-schema-export',
    {
      resolve: 'gatsby-plugin-netlify',
      options: {
        mergeLinkHeaders: false,
        mergeCachingHeaders: false,
      },
    },
  ];
  lines[index] = `plugins: ${JSON.stringify(plugins)},`;
  return lines;
});

$$.file('package.json', (json) => ({
  ...json,
  scripts: {
    ...json.scripts,
    ...{
      prepare: 'yarn codegen',
      'schema:update': 'SCHEMA_UPDATE=true yarn build && yarn codegen',
      codegen: 'graphql-codegen --config codegen.yml',
    },
  },
}));
```

```yml
# |-> codegen.yml

overwrite: true
generates:
  generated/types/gatsby.d.ts:
    schema: generated/schema.graphql
    documents:
      - ./src/**/*.{ts,tsx}
      #- ./gatsby-node.ts
    plugins:
      - 'typescript'
      - 'typescript-operations'
    config:
      noExport: true
      maybeValue: T | undefined
      preResolveTypes: false
      skipTypename: true
```

```typescript
$$('yarn prettier . --write');
$$.chdir('../..');
$$('git add .');
$$('git commit -m "chore: add basic gatsby plugins & codegen"');
```

## Export schema

Switch into the newly created directory and attempt to build the website. This
should create a `index.html` file in the `public` folder with the starter kits
dummy content.

We run `yarn schema:update` instead of `yarn build` to build Gatsby and export
its GraphQL schema in one shot.

```typescript
$$.chdir('apps/website');
$$('yarn schema:update');
$$('cat public/index.html', {
  stdout: /Congratulations — you just made a Gatsby site!/,
});
```

Adjust `.gitignore` and commit the exported schema.

```typescript
$$.file('.gitignore', (lines) => [
  'generated/*',
  '!generated/schema.graphql',
  '.cache',
  'public',
  ...lines,
]);
$$('git add .');
$$('git commit -m "chore: export gatsby schema"');
```

## Basic checks

```typescript
$$('yarn test');
```
