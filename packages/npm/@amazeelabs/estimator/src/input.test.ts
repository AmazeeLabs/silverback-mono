import mock from 'mock-fs';

import { scanDirectory } from './input';

beforeEach(mock.restore);

describe('scanDirectory', () => {
  it('fails if the directory does not exist', () => {
    expect(() => scanDirectory('/idontexist')).toThrow(
      'Directory "/idontexist" does not exist.',
    );
  });

  it('does not fail if there are no graphql files', () => {
    mock({
      '/schema': {
        'README.md': '# The readme',
      },
    });
    expect(scanDirectory('/schema')).toEqual([]);
  });

  it('finds .graphqls schema definitions', () => {
    mock({
      '/schema': {
        'schema.graphqls': 'type Query { foo: String }',
        'query.gql': 'query MyQuery { foo }',
      },
    });
    expect(scanDirectory('/schema')).toEqual([
      './query.gql',
      './schema.graphqls',
    ]);
  });
});
