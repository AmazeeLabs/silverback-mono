# Gatsby operations

This Gatsby plugin allows to use persisted query ids provided by
[@amazeelabs/codegen-operation-ids] within templates and in the `createPages`
hook.

## Installation

Install the package and configure the plugin within Gatsby. The only argument is
the path to the file of generated operation ids:

```js
export const plugins = {
  {
    resolve: '@amazeelabs/gatsby-plugin-operations',
    options: {
      operations: './node_modules/@custom/schema/build/operations.json',
    },
  }
}
```

To get proper type checking, you have to augment Gatsby type definitions, by
placing this anywhere in the `src` directory:

```typescript
import {
  AnyOperationId,
  OperationResult,
  OperationVariables,
} from '@custom/schema';

declare module '@amazeelabs/gatsby-plugin-operations' {
  export const graphql: <OperationId extends AnyOperationId>(
    id: OperationId,
  ) => OperationResult<OperationId>;

  function useStaticQuery<Input extends any>(id: Input): Input;

  function graphqlQuery<OperationId extends AnyOperationId>(
    id: OperationId,
    vars?: OperationVariables<OperationId>,
  ): Promise<{
    data: OperationResult<OperationId>;
    errors?: Array<any>;
  }>;
}
```

This relies on the build output of [@amazeelabs/codegen-operation-ids] being
exported by `@custom/schema`.

## Usage

### In templates

For template queries, simply use `graphqlOperation` to define the query export.
The query variable can be used directly to infer the template components
properties.

```typescript
import { graphql } from '@amazeelabs/gatsby-plugin-operations';
import { ViewPageQuery } from '@custom/schema';

export const query = graphql(ViewPageQuery);
export default function Page({
  data,
  pageContext,
}: PageProps<typeof query>) {
  return <div>...</div>
}
```

### In static queries

To run a static query, one can use `graphql` in combination with
`useStaticQuery`. This will yield a fully typed result of the requested query.

```typescript
import { useStaticQuery, graphql } from '@amazeelabs/gatsby-plugin-operations';
import { ListProductsQuery } from '@custom/schema';

const myResult = useStaticQuery(graphql(ListProductsQuery));
```

### In `gatsby-node.mjs`

The `@amazeelabs/gatsby-plugin-operations` package provides a `graphqlQuery`
function that works within the `createPages` hook.

```typescript
import { graphqlQuery } from '@amazeelabs/gatsby-plugin-operations';
import { ListPagesQuery } from '@custom/schema';

export const createPages({actions}) {
  const result = await graphqlQuery(ListPagesQuery);
  result.page.forEach((page) => {
    actions.createPage({});
  })
}
```

[@amazeelabs/codegen-operation-ids]:
  https://www.npmjs.com/package/@amazeelabs/codegen-operation-ids
