import { echo } from '@amazeelabs/test-directives';
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
} from './schema.js';

const schemaSource = await (await loadConfig({
  rootDir: './',
}))!
  .getDefault()
  .getSchema('string');

const schema = buildSchema(schemaSource);

describe('extractSourceMapping', () => {
  it('extracts types with "sourceFrom" directives', () => {
    expect(extractSourceMapping(schema)).toEqual({
      Customer: 'sourceCustomers',
      Employee: 'sourceEmployees',
    });
  });
});

describe('extractResolverMapping', () => {
  it('extracts fields with attached directives', () => {
    expect(extractResolverMapping(schema, { echo })).toEqual({
      Query: {
        value: [['echo', { msg: 'value from schema' }]],
        argument: [['echo', { msg: '$msg' }]],
        parent: [
          ['echo', { msg: 'parent value' }],
          ['echo', { msg: '$' }],
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
        allContacts: [Contact] @gatsbyNodes(type: \\"Contact\\")
        getPerson(id: ID!): Person @gatsbyNode(type: \\"Contact\\", id: \\"$id\\")
      }
      union Person = Customer | Employee
      interface Contact {
        name: String!
        email: Email!
      }
      type Customer implements Contact @sourceFrom(fn: \\"sourceCustomers\\") {
        id: ID!
        name: String!
        email: Email!
      }
      type Employee implements Contact @sourceFrom(fn: \\"sourceEmployees\\") {
        id: ID!
        role: String!
        name: String!
        email: Email!
      }"
    `);
  });
});

describe('executeResolver', () => {
  it('executes a single resolver', async () => {
    const resolver = await buildResolver(
      [['echo', { msg: 'value from schema' }]],
      { echo },
    );
    expect(resolver(undefined, {}, undefined, null as any)).toEqual(
      'value from schema',
    );
  });
  it('passes through the respective property of the parent value', async () => {
    const resolver = await buildResolver([['echo', { msg: '$' }]], { echo });
    expect(
      resolver({ p: 'parent value' }, {}, undefined, { fieldName: 'p' } as any),
    ).toEqual('parent value');
  });
  it('passes through arguments', async () => {
    const resolver = await buildResolver([['echo', { msg: '$msg' }]], { echo });
    expect(
      resolver(undefined, { msg: 'argument value' }, undefined, null as any),
    ).toEqual('argument value');
  });
  it('chains directives', async () => {
    const resolver = await buildResolver(
      [
        ['echo', { msg: 'my value' }],
        ['echo', { msg: '$' }],
      ],
      { echo },
    );
    expect(resolver(undefined, {}, undefined, null as any)).toEqual('my value');
  });
});
