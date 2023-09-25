import { directives } from '@amazeelabs/test-directives';
import { buildSchema } from 'graphql';
import { loadConfig } from 'graphql-config';
import { describe, expect, it } from 'vitest';

import {
  buildResolver,
  cleanSchema,
  extractInterfaces,
  extractResolverMapping,
  extractSourceMapping,
  extractUnions,
  loadFunction,
  registerDirectiveImplementation,
} from './schema.js';

const schemaSource = await (await loadConfig({
  rootDir: './',
}))!
  .getDefault()
  .getSchema('string');

const schema = buildSchema(schemaSource);

directives(registerDirectiveImplementation);

describe('extractSourceMapping', () => {
  it('extracts types with "sourceFrom" directives', () => {
    expect(extractSourceMapping(schema)).toEqual({
      Customer: '@amazeelabs/test-directives#sourceCustomers',
      Employee: '@amazeelabs/test-directives#sourceEmployees',
    });
  });
});

describe('extractResolverMapping', () => {
  it('extracts types with "resolveBy" directives', () => {
    expect(extractResolverMapping(schema)).toEqual({
      Query: {
        value: [['echo', { msg: 'value from schema' }]],
        argument: [['echo', { msg: '$msg' }]],
        parent: [
          ['echo', { msg: 'parent value' }],
          ['echo', { msg: '$' }],
        ],
        allContacts: [
          ['resolveBy', { fn: '@amazeelabs/test-directives#allContacts' }],
        ],
        getPerson: [
          ['resolveBy', { fn: '@amazeelabs/test-directives#getPerson' }],
        ],
      },
    });
  });
});

describe('extractInterfaces', () => {
  it('extracts all interface type names', () => {
    expect(extractInterfaces(schema)).toEqual(['Contact']);
  });
});

describe('extractUnions', () => {
  it('extracts all union type names', () => {
    expect(extractUnions(schema)).toEqual(['Person']);
  });
});

describe('cleanSchema', () => {
  it('removes the schema and directive definitions', async () => {
    expect(cleanSchema(schemaSource)).toMatchInlineSnapshot(`
      "scalar Email
      type Query {
        value: String @echo(msg: \\"value from schema\\")
        argument(msg: String!): String @echo(msg: \\"$msg\\")
        parent: String @echo(msg: \\"parent value\\") @echo(msg: \\"$\\")
        allContacts: [Contact] @resolveBy(fn: \\"@amazeelabs/test-directives#allContacts\\")
        getPerson(id: ID!): Person @resolveBy(fn: \\"@amazeelabs/test-directives#getPerson\\")
      }
      union Person = Customer | Employee
      interface Contact {
        name: String!
        email: Email!
      }
      type Customer implements Contact @sourceFrom(fn: \\"@amazeelabs/test-directives#sourceCustomers\\") {
        id: ID!
        name: String!
        email: Email!
      }
      type Employee implements Contact @sourceFrom(fn: \\"@amazeelabs/test-directives#sourceEmployees\\") {
        id: ID!
        role: String!
        name: String!
        email: Email!
      }"
    `);
  });
});

describe('loadFunction', () => {
  it('loads a function from a package', async () => {
    expect(
      (await loadFunction('@amazeelabs/test-directives#sourceCustomers'))(),
    ).toMatchInlineSnapshot(`
      [
        [
          "frank",
          {
            "__typename": "Customer",
            "email": "frank@another.company",
            "id": "frank",
            "name": "Frank Sinatra",
          },
        ],
        [
          "elvis",
          {
            "__typename": "Customer",
            "email": "elvis@another.company",
            "id": "elvis",
            "name": "Elvis Presley",
          },
        ],
      ]
    `);
  });
});

describe('executeResolver', () => {
  it('executes a single resolver', async () => {
    const resolver = await buildResolver([
      ['echo', { msg: 'value from schema' }],
    ]);
    expect(resolver(undefined, {}, undefined, null as any)).toEqual(
      'value from schema',
    );
  });
  it('passes through the respective property of the parent value', async () => {
    const resolver = await buildResolver([['echo', { msg: '$' }]]);
    expect(
      resolver({ p: 'parent value' }, {}, undefined, { fieldName: 'p' } as any),
    ).toEqual('parent value');
  });
  it('passes through arguments', async () => {
    const resolver = await buildResolver([['echo', { msg: '$msg' }]]);
    expect(
      resolver(undefined, { msg: 'argument value' }, undefined, null as any),
    ).toEqual('argument value');
  });
  it('chains directives', async () => {
    const resolver = await buildResolver([
      ['echo', { msg: 'my value' }],
      ['echo', { msg: '$' }],
    ]);
    expect(resolver(undefined, {}, undefined, null as any)).toEqual('my value');
  });
  it('deals with resolveBy', async () => {
    const resolver = await buildResolver([
      ['resolveBy', { fn: '@amazeelabs/test-directives#sourceEmployees' }],
    ]);
    expect(
      resolver(undefined, { id: 'john' }, undefined, null as any),
    ).toHaveLength(2);
  });
});
