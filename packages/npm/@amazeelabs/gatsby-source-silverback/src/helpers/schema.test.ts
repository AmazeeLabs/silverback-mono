import { buildSchema } from 'graphql';
import { loadConfig } from 'graphql-config';
import { describe, expect, it } from 'vitest';

import {
  cleanSchema,
  extractInterfaces,
  extractNodeTypes,
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

describe('extractNodeTypes', () => {
  it('extracts types custom directives that suggest its sourced from somewhere', () => {
    expect(extractNodeTypes(schema)).toEqual([
      'Customer',
      'Employee',
      'Celebrity',
      'WithDirective',
      'WithCustomAndDefaultDirective',
    ]);
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
        allContacts: [Contact]
        getPerson(id: ID!): Person
      }
      union Person = Customer | Employee
      interface Contact {
        name: String!
        email: Email!
      }
      type Customer implements Contact {
        id: ID!
        name: String!
        email: Email!
      }
      type Employee implements Contact {
        id: ID!
        role: String!
        name: String!
        email: Email!
      }
      type Celebrity implements Contact {
        id: ID!
        name: String!
        email: Email!
      }
      type WithoutDirective {
        id: ID!
      }
      type WithDirective {
        id: ID!
      }
      type WithTypeDirective {
        id: ID!
      }
      type WithDefaultDirective {
        id: ID!
      }
      type WithTypeAndDefaultDirective {
        id: ID!
      }
      type WithCustomAndDefaultDirective {
        id: ID!
      }"
    `);
  });
});
