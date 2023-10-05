import { readFileSync } from 'fs';
import { buildSchema, graphql, GraphQLFieldResolver } from 'graphql';
import { describe, expect, it } from 'vitest';

import {
  buildResolver,
  createResolveConfig,
  extractResolverMapping,
} from './resolvers';

const schema = buildSchema(
  readFileSync('./src/test/schema.graphql').toString(),
);

const echo: GraphQLFieldResolver<unknown, any, { msg: string }> = (
  _,
  { msg },
) => msg;

describe('extractResolverMapping', () => {
  it('extracts fields with attached directives', () => {
    expect(extractResolverMapping(schema, { echo })).toEqual({
      Query: {
        value: [['echo', { msg: 'hardcoded' }]],
        argument: [['echo', { msg: '$msg' }]],
        parent: [
          ['echo', { msg: 'parent' }],
          ['echo', { msg: '$' }],
        ],
      },
    });
  });
});

describe('executeResolver', () => {
  it('executes a single resolver', async () => {
    const resolver = buildResolver([['echo', { msg: 'value from schema' }]], {
      echo,
    });
    expect(resolver(undefined, {}, undefined, null as any)).toEqual(
      'value from schema',
    );
  });
  it('passes through the respective property of the parent value', async () => {
    const resolver = buildResolver([['echo', { msg: '$' }]], { echo });
    expect(
      resolver({ p: 'parent value' }, {}, undefined, { fieldName: 'p' } as any),
    ).toEqual('parent value');
  });
  it('passes through arguments', async () => {
    const resolver = buildResolver([['echo', { msg: '$msg' }]], { echo });
    expect(
      resolver(undefined, { msg: 'argument value' }, undefined, null as any),
    ).toEqual('argument value');
  });
  it('chains directives', async () => {
    const resolver = buildResolver(
      [
        ['echo', { msg: 'my value' }],
        ['echo', { msg: '$' }],
      ],
      { echo },
    );
    expect(resolver(undefined, {}, undefined, null as any)).toEqual('my value');
  });
});

describe('createResolveConfig', () => {
  it('creates a valid configuration', async () => {
    const config = createResolveConfig(schema, { echo });
    const source = `
    query {
      value
      argument(msg: "argument")
      parent
    }
    `;
    const result = await graphql({
      schema,
      source,
      contextValue: undefined,
      variableValues: {},
      fieldResolver: async (source, args, context, info) => {
        return config[info.parentType.name]?.[info.fieldName]
          ? config[info.parentType.name][info.fieldName](
              source,
              args,
              context,
              info,
            )
          : source[info.fieldName];
      },
    });

    expect(result.data).toEqual({
      value: 'hardcoded',
      argument: 'argument',
      parent: 'parent',
    });
  });
});
