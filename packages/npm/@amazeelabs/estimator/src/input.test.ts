import mock from 'mock-fs';

import { scanDocuments } from './input';

beforeEach(mock.restore);

describe('scanDocuments', () => {
  it('from a single graphql file', () => {
    mock({
      '/schema': {
        'website.graphql': 'type Query { foo: String! }',
      },
    });
    expect(scanDocuments('/schema/website.graphql')).toEqual(
      'type Query { foo: String! }',
    );
  });

  it('reads tags from a typescript file', () => {
    mock({
      '/schema': {
        'fragments.ts': `
        import graphql from 'gatsby';
        const a = graphql\`fragment A on Test { foo }\`;
        const b = graphql\`fragment B on Test { bar }\`;
        `,
      },
    });

    expect(scanDocuments('/schema')).toEqual(
      ['fragment A on Test { foo }', 'fragment B on Test { bar }'].join('\n'),
    );
  });

  it('reads from a directory', () => {
    mock({
      '/schema': {
        'website.graphql': 'type Query { foo: String! }',
      },
    });
    expect(scanDocuments('/schema')).toEqual('type Query { foo: String! }');
  });

  it('does not fail if an input does not exists', () => {
    expect(() => scanDocuments('/idontexist')).not.toThrow();
    expect(() => scanDocuments(['/idontexist'])).not.toThrow();
  });

  it('does not fail if there are no graphql files', () => {
    mock({
      '/schema': {
        'README.md': '# The readme',
      },
    });
    expect(scanDocuments('/schema')).toEqual('');
  });

  it('combines everything recursively', () => {
    mock({
      '/gatsby': {
        src: {
          'something.ts': `
          import graphql from 'gatsby';
          export const fragment = graphql\`fragment Something on Test { foobar }\`;
          `,
        },
      },
      '/schema': {
        'schema.graphqls': 'type Query { foo: String }',
        fragments: {
          'a.gql': 'fragment A on Test { foo }',
        },
      },
    });
    expect(scanDocuments(['/schema', '/gatsby'])).toEqual(
      [
        'fragment A on Test { foo }',
        'type Query { foo: String }',
        'fragment Something on Test { foobar }',
      ].join('\n'),
    );
  });
});
