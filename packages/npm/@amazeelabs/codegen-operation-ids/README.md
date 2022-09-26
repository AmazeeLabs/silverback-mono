# GraphQL operation id generator

A [GraphQL Codegen] plugin to generate operation ids for your queries and
mutations. Can be used with any request framework, be it [react-query], [urql]
or plain fetch.

[graphql codegen]: https://www.the-guild.dev/graphql/codegen
[react-query]: https://tanstack.com/query/v4
[urql]: https://formidable.com/open-source/urql/

## Usage

Install the plugin and add it to your `codegen.yml` configuration file. When
used on its own to generate a `.json` file, it will produce a query map that can
be used by a GraphQL service to execute queries by id.

```yaml
generated/map.json:
  documents:
    - ./graphql-files/**/*.gql
  plugins:
    - '@amazeelabs/codegen-operation-ids'
```

If it is applied in combination with `typescript` and `typescript-operations` to
generate a `.ts` file, it will append utility types and an exported variable for
each operation found. The variable itself is just the query id, but it is
annotated with type information about input and output of the operation. This
can be used to type the resulting requests based on the provided operation id.

```yaml
generated/schema.ts:
  documents:
    - ./graphql-files/**/*.gql
  plugins:
    - typescript
    - typescript-operations
    - '@amazeelabs/codegen-operation-ids'
```

```ts
import {
  MyQuery,
  OperationResults,
  OperationVariables,
  AnyOperationId,
} from './generated/schema';

function graphqlFetch<T extends AnyOperationId>(
  id: T,
  variables: OperationVariables<T>,
): Promise<OperationResult<T>> {
  return fetch('/graphql', {
    method: 'POST',
    body: JSON.stringify({
      id,
      variables,
    }),
  }).then((response) => response.json());
}
```
