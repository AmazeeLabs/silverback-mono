import { analyzeOperations, analyzeSchemas } from './analyze';

type Results = Partial<ReturnType<typeof analyzeSchemas>>;

describe('analyzeSchemas', () => {
  function assertResult(document: string, results: Results) {
    expect(
      analyzeSchemas(document, ['property', 'entity', 'entityType', 'blocks']),
    ).toMatchObject(results);
  }

  describe('accepts', () => {
    it('a single document', () => {
      expect(() =>
        analyzeSchemas('type Article { title: String! }'),
      ).not.toThrow();
    });

    it('multiple documents', () => {
      expect(() =>
        analyzeSchemas('type Article { title: String! }'),
      ).not.toThrow();
    });
  });

  it('errors on invalid documents', () => {
    expect(() => analyzeSchemas('invalid')).toThrow();
  });

  describe('counts type definitions', () => {
    it('of objects', () => {
      assertResult('type Article { title: String! }', {
        OBJECT_DEFINITION: 1,
      });
    });

    it('of inputs', () => {
      assertResult('input Credentials { user: String!, pass: String! }', {
        INPUT_DEFINITION: 1,
      });
    });

    it.each(['Query', 'Mutation', 'Subscription'])(
      'but ignores the root %s type',
      (type) => {
        assertResult(`type ${type} { status: String }`, {
          OBJECT_DEFINITION: 0,
        });
      },
    );
  });

  describe('counts field definitions', () => {
    const dataSet = [
      ['Query', { QUERY_FIELD_DEFINITION: 1 }],
      ['Mutation', { MUTATION_FIELD_DEFINITION: 1 }],
      ['Subscription', { SUBSCRIPTION_FIELD_DEFINITION: 1 }],
    ] as Array<[string, Results]>;

    test.each(dataSet)('on the root %s type', (type, result) => {
      assertResult(`type ${type} { status: String }`, result);
    });

    test.each(dataSet)('on root %s type extensions', (type, result) => {
      assertResult(`extend type ${type} { status: String }`, result);
    });

    test('on object types', () => {
      assertResult('type Article { status: String }', {
        OBJECT_FIELD_DEFINITION: 1,
      });
    });

    test('on object type extensions', () => {
      assertResult('extend type Article { status: String }', {
        OBJECT_FIELD_DEFINITION: 1,
      });
    });

    it('on input types', () => {
      assertResult('input Credentials { user: String!, pass: String! }', {
        INPUT_FIELD_DEFINITION: 2,
      });
    });

    it('on input type extensions', () => {
      assertResult(
        'extend input Credentials { user: String!, pass: String! }',
        {
          INPUT_FIELD_DEFINITION: 2,
        },
      );
    });
  });

  describe('counts arguments', () => {
    it('of fields', () => {
      assertResult('type Query { loadArticle(id: String!) : Article }', {
        FIELD_ARGUMENT_DEFINITION: 1,
      });
    });
  });

  describe('counts list types', () => {
    it('on field arguments', () => {
      assertResult('type Query { loadArticle(id: [String]) : Article }', {
        LIST_TYPE: 1,
      });
    });

    it('in field return types', () => {
      assertResult('type Query { listArticles: [Article!]! }', {
        LIST_TYPE: 1,
      });
      assertResult('type Query { listArticles: [[Article!]!]! }', {
        LIST_TYPE: 2,
      });
    });

    it('in input fields', () => {
      assertResult('input Credentials { user: [String!]!, pass: String! }', {
        LIST_TYPE: 1,
      });
    });
  });

  describe('counts nullable types', () => {
    it('on field arguments', () => {
      assertResult('type Query { loadArticle(id: String) : Article! }', {
        NULLABLE_TYPE: 1,
      });
    });

    it('in field return types', () => {
      assertResult('type Query { loadArticle: Article }', {
        NULLABLE_TYPE: 1,
      });
      assertResult('type Query { listArticles: [[Article]] }', {
        NULLABLE_TYPE: 3,
      });
    });

    it('in input fields', () => {
      assertResult('input Credentials { user: String, pass: String! }', {
        NULLABLE_TYPE: 1,
      });
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

  describe('counts directives instead of', () => {
    it('field definitions', () => {
      assertResult(
        'type Article { title: String! @property(path: "title.0.value" )}',
        {
          property: 1,
          OBJECT_FIELD_DEFINITION: 0,
        },
      );
    });

    it('type definitions', () => {
      assertResult(
        'type Article @entity(type: "node", bundle: "article") { title: String! }',
        {
          entity: 1,
          OBJECT_DEFINITION: 0,
        },
      );
    });

    it('interface definitions', () => {
      assertResult(
        'interface Page @entityType(type: "node") { title: String! }',
        {
          entityType: 1,
          INTERFACE_DEFINITION: 0,
        },
      );
    });

    it('union definitions', () => {
      assertResult('union Blocks @blocks = A | B', {
        blocks: 1,
        UNION_DEFINITION: 0,
      });
    });
  });
});

describe('analyzeOperations', () => {
  function assertResult(document: string, results: Results) {
    expect(analyzeOperations(document)).toMatchObject(results);
  }
  describe('accepts', () => {
    it('a single document', () => {
      expect(() =>
        analyzeOperations('type Article { title: String! }'),
      ).not.toThrow();
    });
    it('multiple documents', () => {
      expect(() =>
        analyzeOperations('type Article { title: String! }'),
      ).not.toThrow();
    });
  });

  it('errors on invalid couments', () => {
    expect(() => analyzeOperations('invalid')).toThrow();
  });

  describe('counts operations', () => {
    it('of query type', () => {
      assertResult('query Foo { bar }', {
        QUERY_OPERATION: 1,
      });
    });

    it('of mutation type', () => {
      assertResult('mutation Foo { bar }', {
        MUTATION_OPERATION: 1,
      });
    });

    it('of subscription type', () => {
      assertResult('subscription Foo { bar }', {
        SUBSCRIPTION_OPERATION: 1,
      });
    });
  });

  describe('counts arguments', () => {
    it('of operations', () => {
      assertResult(
        'mutation login($user: String!, $pass: String!) { login(user: $user, pass: $pass ) }',
        {
          VARIABLE_DECLARATION: 2,
        },
      );
    });
  });

  it('counts fragment declarations', () => {
    assertResult('fragment Article on Article { title }', {
      FRAGMENT_DECLARATION: 1,
    });
  });

  describe('subselections', () => {
    it('on operations', () => {
      assertResult('query Foo { bar { baz } }', {
        SUBSELECTION_DECLARATION: 1,
      });
    });

    it('on fragments', () => {
      assertResult('fragment Article on Article { bar { baz } }', {
        SUBSELECTION_DECLARATION: 1,
      });
    });

    it('withing subselections', () => {
      assertResult('fragment Article on Article { bar { baz { foo } } }', {
        SUBSELECTION_DECLARATION: 2,
      });
    });
  });

  describe('counts inline fragments', () => {
    it('on operations', () => {
      assertResult('query Foo { bar { ... on Foo { baz } } }', {
        INLINE_FRAGMENT_DECLARATION: 1,
      });
    });

    it('on fragments', () => {
      assertResult(
        'fragment Article on Article { bar { ... on Foo { baz } } }',
        {
          INLINE_FRAGMENT_DECLARATION: 1,
        },
      );
    });

    it('within inline fragments', () => {
      assertResult(
        'fragment Article on Article { bar { ... on Foo { baz { ... on Bar { foo } } } } }',
        {
          INLINE_FRAGMENT_DECLARATION: 2,
        },
      );
    });
  });

  describe('counts field invocations', () => {
    it('on operations', () => {
      assertResult('query Foo { bar }', {
        FIELD_INVOCATION: 1,
      });
    });

    it('on fragments', () => {
      assertResult('fragment Article on Article { bar }', {
        FIELD_INVOCATION: 1,
      });
    });

    it('in subselections', () => {
      assertResult('query Foo { bar { baz } }', {
        FIELD_INVOCATION: 2,
      });
    });
  });
});
