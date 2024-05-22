import { parse } from 'graphql';
import { describe, expect, it, test, TestContext } from 'vitest';

import { analyze } from './analyze.js';

async function assertResult(
  document: string,
  results: Record<string, number>,
  { repo, effectValue }: TestContext,
) {
  await repo.write(
    '.estimatorrc.json',
    JSON.stringify({
      weights: {
        directives: { property: 0, entity: 0, entityType: 0, blocks: 0 },
      },
    }),
  );
  const program = analyze(parse(document));
  const result = await effectValue(program);
  expect(result).toMatchObject(results);
}

describe('analyze', () => {
  describe('counts type definitions', () => {
    it('of objects', async (ctx) => {
      await assertResult(
        'type Article { title: String! }',
        {
          OBJECT_DEFINITION: 1,
        },
        ctx,
      );
    });

    it('of inputs', async (ctx) => {
      await assertResult(
        'input Credentials { user: String!, pass: String! }',
        {
          INPUT_DEFINITION: 1,
        },
        ctx,
      );
    });

    describe.each(['Query', 'Mutation', 'Subscription'])(
      'but ignores',
      (type) => {
        it(`the root ${type} type`, async (ctx) => {
          await assertResult(`type ${type} { status: String }`, {}, ctx);
        });
      },
    );
  });

  describe('counts field definitions', () => {
    const dataSet = [
      ['Query', { QUERY_FIELD_DEFINITION: 1 }],
      ['Mutation', { MUTATION_FIELD_DEFINITION: 1 }],
      ['Subscription', { SUBSCRIPTION_FIELD_DEFINITION: 1 }],
    ] as Array<[string, Record<string, number>]>;

    describe.each(dataSet)('on', (type, result) => {
      it(`the root ${type} type`, async (ctx) => {
        await assertResult(`type ${type} { status: String }`, result, ctx);
      });
    });

    describe.each(dataSet)('on', (type, result) => {
      it(`root ${type} type`, async (ctx) => {
        await assertResult(
          `extend type ${type} { status: String }`,
          result,
          ctx,
        );
      });
    });

    test('on object types', async (ctx) => {
      await assertResult(
        'type Article { status: String }',
        {
          OBJECT_FIELD_DEFINITION: 1,
        },
        ctx,
      );
    });

    test('on object type extensions', async (ctx) => {
      await assertResult(
        'extend type Article { status: String }',
        {
          OBJECT_FIELD_DEFINITION: 1,
        },
        ctx,
      );
    });

    it('on input types', async (ctx) => {
      await assertResult(
        'input Credentials { user: String!, pass: String! }',
        {
          INPUT_FIELD_DEFINITION: 2,
        },
        ctx,
      );
    });

    it('on input type extensions', async (ctx) => {
      await assertResult(
        'extend input Credentials { user: String!, pass: String! }',
        {
          INPUT_FIELD_DEFINITION: 2,
        },
        ctx,
      );
    });
  });

  describe('counts arguments', () => {
    it('of fields', async (ctx) => {
      await assertResult(
        'type Query { loadArticle(id: String!) : Article }',
        {
          FIELD_ARGUMENT_DEFINITION: 1,
        },
        ctx,
      );
    });
  });

  describe('counts list types', () => {
    it('on field arguments', async (ctx) => {
      await assertResult(
        'type Query { loadArticle(id: [String]) : Article }',
        {
          LIST_TYPE: 1,
        },
        ctx,
      );
    });

    it('in field return types', async (ctx) => {
      await assertResult(
        'type Query { listArticles: [Article!]! }',
        {
          LIST_TYPE: 1,
        },
        ctx,
      );
      await assertResult(
        'type Query { listArticles: [[Article!]!]! }',
        {
          LIST_TYPE: 2,
        },
        ctx,
      );
    });

    it('in input fields', async (ctx) => {
      await assertResult(
        'input Credentials { user: [String!]!, pass: String! }',
        {
          LIST_TYPE: 1,
        },
        ctx,
      );
    });
  });

  describe('counts nullable types', () => {
    it('on field arguments', async (ctx) => {
      await assertResult(
        'type Query { loadArticle(id: String) : Article! }',
        {
          NULLABLE_TYPE: 1,
        },
        ctx,
      );
    });

    it('in field return types', async (ctx) => {
      await assertResult(
        'type Query { loadArticle: Article }',
        {
          NULLABLE_TYPE: 1,
        },
        ctx,
      );
      await assertResult(
        'type Query { listArticles: [[Article]] }',
        {
          NULLABLE_TYPE: 3,
        },
        ctx,
      );
    });

    it('in input fields', async (ctx) => {
      await assertResult(
        'input Credentials { user: String, pass: String! }',
        {
          NULLABLE_TYPE: 1,
        },
        ctx,
      );
    });
  });

  it('counts interface definitions', async (ctx) => {
    await assertResult(
      'interface Page { title: String!, path: String! }',
      {
        INTERFACE_DEFINITION: 1,
      },
      ctx,
    );
  });

  it('counts union type definitions', async (ctx) => {
    await assertResult(
      'union Block = A | B',
      {
        UNION_DEFINITION: 1,
      },
      ctx,
    );
  });

  describe('counts directives instead of', () => {
    it('field definitions', async (ctx) => {
      await assertResult(
        'type Article { title: String! @property(path: "title.0.value" )}',
        {
          property: 1,
        },
        ctx,
      );
    });

    it('type definitions', async (ctx) => {
      await assertResult(
        'type Article @entity(type: "node", bundle: "article") { title: String! }',
        {
          entity: 1,
        },
        ctx,
      );
    });

    it('interface definitions', async (ctx) => {
      await assertResult(
        'interface Page @entityType(type: "node") { title: String! }',
        {
          entityType: 1,
        },
        ctx,
      );
    });

    it('union definitions', async (ctx) => {
      await assertResult(
        'union Blocks @blocks = A | B',
        {
          blocks: 1,
        },
        ctx,
      );
    });
  });

  describe('counts operations', () => {
    it('of query type', async (ctx) => {
      await assertResult(
        'query Foo { bar }',
        {
          QUERY_OPERATION: 1,
        },
        ctx,
      );
    });

    it('of mutation type', async (ctx) => {
      await assertResult(
        'mutation Foo { bar }',
        {
          MUTATION_OPERATION: 1,
        },
        ctx,
      );
    });

    it('of subscription type', async (ctx) => {
      await assertResult(
        'subscription Foo { bar }',
        {
          SUBSCRIPTION_OPERATION: 1,
        },
        ctx,
      );
    });
  });

  describe('counts arguments', () => {
    it('of operations', async (ctx) => {
      await assertResult(
        'mutation login($user: String!, $pass: String!) { login(user: $user, pass: $pass ) }',
        {
          VARIABLE_DECLARATION: 2,
        },
        ctx,
      );
    });
  });

  it('counts fragment declarations', async (ctx) => {
    await assertResult(
      'fragment Article on Article { title }',
      {
        FRAGMENT_DECLARATION: 1,
      },
      ctx,
    );
  });

  describe('subselections', () => {
    it('on operations', async (ctx) => {
      await assertResult(
        'query Foo { bar { baz } }',
        {
          SUBSELECTION_DECLARATION: 1,
        },
        ctx,
      );
    });

    it('on fragments', async (ctx) => {
      await assertResult(
        'fragment Article on Article { bar { baz } }',
        {
          SUBSELECTION_DECLARATION: 1,
        },
        ctx,
      );
    });

    it('withing subselections', async (ctx) => {
      await assertResult(
        'fragment Article on Article { bar { baz { foo } } }',
        {
          SUBSELECTION_DECLARATION: 2,
        },
        ctx,
      );
    });
  });

  describe('counts inline fragments', () => {
    it('on operations', async (ctx) => {
      await assertResult(
        'query Foo { bar { ... on Foo { baz } } }',
        {
          INLINE_FRAGMENT_DECLARATION: 1,
        },
        ctx,
      );
    });

    it('on fragments', async (ctx) => {
      await assertResult(
        'fragment Article on Article { bar { ... on Foo { baz } } }',
        {
          INLINE_FRAGMENT_DECLARATION: 1,
        },
        ctx,
      );
    });

    it('within inline fragments', async (ctx) => {
      await assertResult(
        'fragment Article on Article { bar { ... on Foo { baz { ... on Bar { foo } } } } }',
        {
          INLINE_FRAGMENT_DECLARATION: 2,
        },
        ctx,
      );
    });
  });

  describe('counts field invocations', () => {
    it('on operations', async (ctx) => {
      await assertResult(
        'query Foo { bar }',
        {
          FIELD_INVOCATION: 1,
        },
        ctx,
      );
    });

    it('on fragments', async (ctx) => {
      await assertResult(
        'fragment Article on Article { bar }',
        {
          FIELD_INVOCATION: 1,
        },
        ctx,
      );
    });

    it('in subselections', async (ctx) => {
      await assertResult(
        'query Foo { bar { baz } }',
        {
          FIELD_INVOCATION: 2,
        },
        ctx,
      );
    });
  });
});
