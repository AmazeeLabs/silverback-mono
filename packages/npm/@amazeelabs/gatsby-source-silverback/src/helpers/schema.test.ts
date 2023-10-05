import { buildSchema } from 'graphql';
import { loadConfig } from 'graphql-config';
import { describe, expect, it } from 'vitest';

import {
  cleanSchema,
  extractInterfaces,
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
