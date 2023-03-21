import { parse } from 'graphql/language';
import { buildSchema } from 'graphql/utilities';
import { describe, expect, it } from 'vitest';

import { plugin } from './';

describe('codegen-gatsby-fragments', () => {
  const schema = buildSchema(`query { foo } mutation { bar }`);
  it('creates an empty graphql tag if there are no documents', () => {
    expect(plugin(schema, [], {})).toMatchInlineSnapshot(
      '"const {graphql} = require(\'gatsby\');const fragments = graphql``;export { fragments };"',
    );
  });

  it('ignores queries and mutations', () => {
    expect(
      plugin(
        schema,
        [
          {
            location: 'queries.gql',
            document: parse(`query Foo { foo } mutation Bar { bar }`),
            schema,
          },
        ],
        {},
      ),
    ).toMatchInlineSnapshot(
      '"const {graphql} = require(\'gatsby\');const fragments = graphql``;export { fragments };"',
    );
  });

  it('includes a single fragment', () => {
    expect(
      plugin(
        schema,
        [
          {
            location: 'queries.gql',
            document: parse(`fragment Foo on Query { foo }`),
            schema,
          },
        ],
        {},
      ),
    ).toMatchInlineSnapshot(`
      "const {graphql} = require('gatsby');const fragments = graphql\`fragment Foo on Query {
        foo
      }\`;export { fragments };"
    `);
  });

  it('includes multiple fragments from the same file', () => {
    expect(
      plugin(
        schema,
        [
          {
            location: 'queries.gql',
            document: parse(
              `fragment Foo on Query { foo } fragment Bar on Query { bar }`,
            ),
            schema,
          },
        ],
        {},
      ),
    ).toMatchInlineSnapshot(`
      "const {graphql} = require('gatsby');const fragments = graphql\`fragment Foo on Query {
        foo
      }
      fragment Bar on Query {
        bar
      }\`;export { fragments };"
    `);
  });

  it('includes multiple fragments from multiple files', () => {
    expect(
      plugin(
        schema,
        [
          {
            location: 'a.gql',
            document: parse(`fragment Foo on Query { foo }`),
            schema,
          },
          {
            location: 'b.gql',
            document: parse(`fragment Bar on Query { bar }`),
            schema,
          },
        ],
        {},
      ),
    ).toMatchInlineSnapshot(`
      "const {graphql} = require('gatsby');const fragments = graphql\`fragment Foo on Query {
        foo
      }
      fragment Bar on Query {
        bar
      }\`;export { fragments };"
    `);
  });
});
