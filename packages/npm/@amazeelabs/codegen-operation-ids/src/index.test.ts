import { Types } from '@graphql-codegen/plugin-helpers';
import { buildSchema, parse } from 'graphql';
import { describe, expect, it } from 'vitest';

import { plugin } from './';

const schema = buildSchema(`
  type Query {
    loadPage(path: String!): Page
  }
  type Mutation {
    login(username: String!, password: String!): Boolean!
  }
  type Page {
    title: String!
    path: String!
    related: [Page!]!
  }
  `);

describe('mode: map', () => {
  function runPlugin(documents: Array<Types.DocumentFile>) {
    return plugin(schema, documents, {}, { outputFile: 'map.json' });
  }

  it('creates a map entry for a single operation', async () => {
    const result = await runPlugin([
      {
        location: 'queries.gql',
        document: parse(`query Home { loadPage(path: "/") { title } }`),
        schema,
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
      }
    `);
  });

  it('creates map entries for multiple operations in one document', async () => {
    const result = await runPlugin([
      {
        location: 'queries.gql',
        document: parse(`
        query Home { loadPage(path: "/") { title } }
        query Sitemap { loadPage(path: "/sitemap") { title } }
        `),
        schema,
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
        "Sitemap:58d3e46159d03193c571a8d6d2101a93456902d63a9b9d8c925f7d4cb8c69b0a": "query Sitemap {
        loadPage(path: "/sitemap") {
          title
        }
      }",
      }
    `);
  });

  it('creates map entries for multiple operations in multiple documents', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        query Home { loadPage(path: "/") { title } }
        `),
        schema,
      },
      {
        location: 'b.gql',
        document: parse(`
        query Sitemap { loadPage(path: "/sitemap") { title } }
        `),
        schema,
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
        "Sitemap:58d3e46159d03193c571a8d6d2101a93456902d63a9b9d8c925f7d4cb8c69b0a": "query Sitemap {
        loadPage(path: "/sitemap") {
          title
        }
      }",
      }
    `);
  });

  it('ignores unused fragments', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        fragment Page on Page { title }
        query Home { loadPage(path: "/") { title } }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
      }
    `);
  });

  it('adds used fragments', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        fragment Page on Page { title }
        query Home { loadPage(path: "/") { ...Page } }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
      }
    `);
  });
  it('inlines multiple invocations', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        fragment Page on Page { title }
        query Home {
          loadPage(path: "/") {
            ...Page,
            related {
              ...Page
            }
          }
        }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:126fe24c4e0358d329a4f1699ece318fbe6c2a6c7f771f240402ccac2dcde676": "query Home {
        loadPage(path: "/") {
          title
          related {
            title
          }
        }
      }",
      }
    `);
  });
  it('adds nested fragments', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        fragment RelatedPage on Page { title }
        fragment Page on Page { title, related { ...RelatedPage } }
        query Home {
          loadPage(path: "/") {
            ...Page,
          }
        }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:126fe24c4e0358d329a4f1699ece318fbe6c2a6c7f771f240402ccac2dcde676": "query Home {
        loadPage(path: "/") {
          title
          related {
            title
          }
        }
      }",
      }
    `);
  });

  it('adds fragments from different documents', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        query Home {
          loadPage(path: "/") {
            ...Page,
          }
        }
        `),
      },
      {
        location: 'b.gql',
        document: parse(`
        fragment Page on Page { title }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6": "query Home {
        loadPage(path: "/") {
          title
        }
      }",
      }
    `);
  });

  it('adds nested fragments from different documents', async () => {
    const result = await runPlugin([
      {
        location: 'a.gql',
        document: parse(`
        query Home {
          loadPage(path: "/") {
            ...Page,
          }
        }
        `),
      },
      {
        location: 'b.gql',
        document: parse(`
        fragment Page on Page { title, related { ...RelatedPage } }
        `),
      },
      {
        location: 'c.gql',
        document: parse(`
        fragment RelatedPage on Page { title }
        `),
      },
    ]);
    expect(JSON.parse(result)).toMatchInlineSnapshot(`
      {
        "Home:126fe24c4e0358d329a4f1699ece318fbe6c2a6c7f771f240402ccac2dcde676": "query Home {
        loadPage(path: "/") {
          title
          related {
            title
          }
        }
      }",
      }
    `);
  });
});

describe('mode: ids', () => {
  function runPlugin(documents: Array<Types.DocumentFile>) {
    return plugin(schema, documents, {}, { outputFile: 'output.ts' });
  }
  it("adds utility types for working with operation id's", async () => {
    const result = await runPlugin([]);
    expect(result).toMatchInlineSnapshot(`
      "declare const OperationId: unique symbol;

      export type OperationId<
        TQueryResult extends any,
        TQueryVariables extends any,
      > = string & {
        _opaque: typeof OperationId;
        ___query_result: TQueryResult;
        ___query_variables: TQueryVariables;
      };

      export type AnyOperationId = OperationId<any, any>;

      export type OperationResult<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_result'];

      export type OperationVariables<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_variables'];"
    `);
  });

  it('creates a typed id for each query', async () => {
    const result = await runPlugin([
      {
        location: 'queries.gql',
        document: parse(`
        fragment Page on Page { title }
        query Home { loadPage(path: "/") { ... Page } }
        `),
        schema,
      },
    ]);
    expect(result).toMatchInlineSnapshot(`
      "declare const OperationId: unique symbol;

      export type OperationId<
        TQueryResult extends any,
        TQueryVariables extends any,
      > = string & {
        _opaque: typeof OperationId;
        ___query_result: TQueryResult;
        ___query_variables: TQueryVariables;
      };

      export type AnyOperationId = OperationId<any, any>;

      export type OperationResult<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_result'];

      export type OperationVariables<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_variables'];
      export const HomeQuery = "Home:37b18153e5d5ac538e6f4b371203b73e0b273d9ea2cd26c8b8eeed655c229db6" as OperationId<HomeQuery,HomeQueryVariables | undefined>;"
    `);
  });

  it('creates a typed id for each mutation', async () => {
    const result = await runPlugin([
      {
        location: 'mutations.gql',
        document: parse(`
        mutation Login ($username: String!, $password: String!) {
          login(username: $username, password: $password)
        }
        `),
        schema,
      },
    ]);
    expect(result).toMatchInlineSnapshot(`
      "declare const OperationId: unique symbol;

      export type OperationId<
        TQueryResult extends any,
        TQueryVariables extends any,
      > = string & {
        _opaque: typeof OperationId;
        ___query_result: TQueryResult;
        ___query_variables: TQueryVariables;
      };

      export type AnyOperationId = OperationId<any, any>;

      export type OperationResult<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_result'];

      export type OperationVariables<TQueryID extends OperationId<any, any>> =
        TQueryID['___query_variables'];
      export const LoginMutation = "Login:10f1c5ac787ce93e9fe860ec9bb4a552967778d3873fbec2ce15fad2164da315" as OperationId<LoginMutation,LoginMutationVariables>;"
    `);
  });
});
