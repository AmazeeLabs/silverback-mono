import { parse } from 'graphql';
import { loadConfig } from 'graphql-config';
import { describe, expect, it } from 'vitest';

import {
  cleanSchema,
  executableDirective,
  extractInterfaces,
  extractResolverMapping,
  extractSourceMapping,
  extractUnions,
} from './schema.js';

const schema = parse(
  await (await loadConfig({
    rootDir: './',
  }))!
    .getDefault()
    .getSchema('string'),
);

describe('extractSourceMapping', () => {
  it('extracts types with "sourceFrom" directives', () => {
    expect(extractSourceMapping(schema)).toEqual({
      Customer: ['@amazeelabs/test-source', 'sourceCustomers'],
      Employee: ['@amazeelabs/test-source', 'sourceEmployees'],
    });
  });
});

describe('extractResolverMapping', () => {
  it('extracts types with "resolveBy" directives', () => {
    expect(extractResolverMapping(schema)).toEqual({
      Query: {
        allContacts: ['@amazeelabs/test-source', 'allContacts'],
        getPerson: ['@amazeelabs/test-source', 'getPerson'],
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
    expect(cleanSchema(schema)).toMatchInlineSnapshot(`
      "scalar Email
      type Query {
        allContacts: [Contact] @resolveBy(fn: \\"@amazeelabs/test-source#allContacts\\")
        getPerson(id: ID!): Person @resolveBy(fn: \\"@amazeelabs/test-source#getPerson\\")
      }
      union Person = Customer | Employee
      interface Contact {
        name: String!
        email: Email!
      }
      type Customer implements Contact @sourceFrom(fn: \\"@amazeelabs/test-source#sourceCustomers\\") {
        id: ID!
        name: String!
        email: Email!
      }
      type Employee implements Contact @sourceFrom(fn: \\"@amazeelabs/test-source#sourceEmployees\\") {
        id: ID!
        role: String!
        name: String!
        email: Email!
      }"
    `);
  });
});

describe('executableDirective', () => {
  it('executes a function from a package', async () => {
    expect(
      (
        await executableDirective('@amazeelabs/test-source', 'sourceCustomers')
      )(),
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
