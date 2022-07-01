import { analyzeDocuments } from './analyze';

describe('analyzeDocuments', () => {
  function assertResult(
    document: string,
    results: Partial<ReturnType<typeof analyzeDocuments>>,
  ) {
    expect(analyzeDocuments(document)).toMatchObject(results);
  }

  it('ignores invalid or empty documents', () => {
    expect(() => analyzeDocuments(['invalid', ''])).not.toThrow();
  });

  it('accepts a single document', () => {
    expect(() =>
      analyzeDocuments('type Article { title: String! }'),
    ).not.toThrow();
  });

  it('counts the number of type definions', () => {
    assertResult('type Article { title: String! }', {
      OBJECT_DEFINITION: 1,
    });
  });

  it('ignores the Query type when counting type definitions', () => {
    assertResult('type Query { status: String }', {
      OBJECT_DEFINITION: 0,
    });
  });

  it('ignores the Mutation type when counting type definitions', () => {
    assertResult('type Mutation { status: String }', { OBJECT_DEFINITION: 0 });
  });

  it('ignores the Subscription type when counting type definitions', () => {
    assertResult('type Subscription { status: String }', {
      OBJECT_DEFINITION: 0,
    });
  });

  it('counts a Query field definition', () => {
    assertResult('type Query { status: String }', {
      QUERY_FIELD_DEFINITION: 1,
    });
  });

  it('counts fields on a  Query extension', () => {
    assertResult('extend type Query { status: String }', {
      QUERY_FIELD_DEFINITION: 1,
    });
  });

  it('counts a Mutation field definition', () => {
    assertResult('type Mutation { status: String }', {
      MUTATION_FIELD_DEFINITION: 1,
    });
  });

  it('counts fields on a Mutation extension', () => {
    assertResult('extend type Mutation { status: String }', {
      MUTATION_FIELD_DEFINITION: 1,
    });
  });

  it('counts a Subscription field definition', () => {
    assertResult('type Subscription { status: String }', {
      SUBSCRIPTION_FIELD_DEFINITION: 1,
    });
  });

  it('counts fields on a Subscription extension', () => {
    assertResult('extend type Subscription { status: String }', {
      SUBSCRIPTION_FIELD_DEFINITION: 1,
    });
  });

  it('counts a Object field definition', () => {
    assertResult('type Article { status: String }', {
      OBJECT_FIELD_DEFINITION: 1,
    });
  });

  it('counts fields on an Object extension', () => {
    assertResult('extend type Article { status: String }', {
      OBJECT_FIELD_DEFINITION: 1,
    });
  });

  it('counts the arguments passed into fields', () => {
    assertResult('type Query { loadArticle(id: String!) : Article }', {
      FIELD_ARGUMENT_DEFINITION: 1,
    });
  });

  it('counts nullable arguments passed into fields', () => {
    assertResult('type Query { loadArticle(id: String) : Article }', {
      NULLABLE_TYPE: 2,
    });
  });

  it('counts list arguments passed into fields', () => {
    assertResult('type Query { loadArticle(id: [String]) : Article }', {
      LIST_TYPE: 1,
    });
  });

  it('counts list return types', () => {
    assertResult('type Query { listArticles: [Article!]! }', {
      LIST_TYPE: 1,
    });
    assertResult('type Query { listArticles: [[Article!]!]! }', {
      LIST_TYPE: 2,
    });
  });

  it('counts nullable return types', () => {
    assertResult('type Query { loadArticle: Article }', {
      NULLABLE_TYPE: 1,
    });
    assertResult('type Query { listArticles: [[Article]] }', {
      NULLABLE_TYPE: 3,
    });
  });

  it('counts interface definitions', () => {
    assertResult('interface Page { title: String!, path: String! }', {
      INTERFACE_DEFINITION: 1,
    });
  });

  it('counts union type definitions', () => {
    assertResult('union Block = A | B', {
      UNION_DEFINITION: 1,
    });
  });

  it('counts input type definitions', () => {
    assertResult('input Credentials { user: String!, pass: String! }', {
      INPUT_DEFINITION: 1,
    });
  });

  it('counts input type field definitions', () => {
    assertResult('input Credentials { user: String!, pass: String! }', {
      INPUT_FIELD_DEFINITION: 2,
    });
  });

  it('counts extenstion input type field definitions', () => {
    assertResult('extend input Credentials { user: String!, pass: String! }', {
      INPUT_FIELD_DEFINITION: 2,
    });
  });

  it('counts list input type fields', () => {
    assertResult('input Credentials { user: [String!]!, pass: String! }', {
      LIST_TYPE: 1,
    });
  });

  it('counts nullable input type fields', () => {
    assertResult('input Credentials { user: String, pass: String! }', {
      NULLABLE_TYPE: 1,
    });
  });

  it('counts query operations', () => {
    assertResult('query Foo { bar }', {
      QUERY_OPERATION: 1,
    });
  });

  it('counts mutation operations', () => {
    assertResult('mutation Foo { bar }', {
      MUTATION_OPERATION: 1,
    });
  });

  it('counts subscription operations', () => {
    assertResult('subscription Foo { bar }', {
      SUBSCRIPTION_OPERATION: 1,
    });
  });

  it('counts operation variables', () => {
    assertResult(
      'mutation login($user: String!, $pass: String!) { login(user: $user, pass: $pass ) }',
      {
        VARIABLE_DECLARATION: 2,
      },
    );
  });

  it('counts list operation variables', () => {
    assertResult(
      'mutation login($user: [String!]!, $pass: String!) { login(user: $user, pass: $pass ) }',
      {
        LIST_TYPE: 1,
      },
    );
  });

  it('counts nullable operation variables', () => {
    assertResult(
      'mutation login($user: String, $pass: String!) { login(user: $user, pass: $pass ) }',
      {
        NULLABLE_TYPE: 1,
      },
    );
  });

  it('counts fragment declarations', () => {
    assertResult('fragment Article on Article { title }', {
      FRAGMENT_DECLARATION: 1,
    });
  });

  it('counts subselections on operations', () => {
    assertResult('query Foo { bar { baz } }', {
      SUBSELECTION_DECLARATION: 1,
    });
  });

  it('counts subselections on fragments', () => {
    assertResult('fragment Article on Article { bar { baz } }', {
      SUBSELECTION_DECLARATION: 1,
    });
  });

  it('counts nested subselections', () => {
    assertResult('fragment Article on Article { bar { baz { foo } } }', {
      SUBSELECTION_DECLARATION: 2,
    });
  });

  it('counts inline fragments on operations', () => {
    assertResult('query Foo { bar { ... on Foo { baz } } }', {
      INLINE_FRAGMENT_DECLARATION: 1,
    });
  });

  it('counts inline fragments on fragments', () => {
    assertResult('fragment Article on Article { bar { ... on Foo { baz } } }', {
      INLINE_FRAGMENT_DECLARATION: 1,
    });
  });

  it('counts nested inline fragments', () => {
    assertResult(
      'fragment Article on Article { bar { ... on Foo { baz { ... on Bar { foo } } } } }',
      {
        INLINE_FRAGMENT_DECLARATION: 2,
      },
    );
  });

  it('counts field invocations on operations', () => {
    assertResult('query Foo { bar }', {
      FIELD_INVOCATION: 1,
    });
  });

  it('counts field invocations on fragments', () => {
    assertResult('fragment Article on Article { bar }', {
      FIELD_INVOCATION: 1,
    });
  });

  it('counts field invocations subselections', () => {
    assertResult('query Foo { bar { baz } }', {
      FIELD_INVOCATION: 2,
    });
  });
});
