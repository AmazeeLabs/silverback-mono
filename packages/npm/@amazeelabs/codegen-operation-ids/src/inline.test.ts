import {
  DefinitionNode,
  FragmentDefinitionNode,
  Kind,
  OperationDefinitionNode,
  parse,
  print,
} from 'graphql';
import { describe, expect, it } from 'vitest';

import { inlineFragments } from './inline';

function isFragmentDefinitionNode(
  def: DefinitionNode,
): def is FragmentDefinitionNode {
  return def.kind === Kind.FRAGMENT_DEFINITION;
}

function isOperationDefinitionNode(
  def: DefinitionNode,
): def is OperationDefinitionNode {
  return def.kind === Kind.OPERATION_DEFINITION;
}

describe('inlineFragments', () => {
  it('inlines a fragment into a query', () => {
    const doc = parse(`
  query {
      ...A
  }
  fragment A on Query {
    myprop
  }
  `);
    const [query] = doc.definitions.filter(isOperationDefinitionNode);
    const [A] = doc.definitions.filter(isFragmentDefinitionNode);
    const inlined = inlineFragments(query, new Map(Object.entries({ A })));
    expect(print(inlined)).toEqual(`{
  ... on Query {
    myprop
  }
}`);
  });

  it('inlines a fragment into a field', () => {
    const doc = parse(`
  query {
    a {
      ...A
    }
  }
  fragment A on A {
    myprop
  }
  `);
    const [query] = doc.definitions.filter(isOperationDefinitionNode);
    const [A] = doc.definitions.filter(isFragmentDefinitionNode);
    const inlined = inlineFragments(query, new Map(Object.entries({ A })));
    expect(print(inlined)).toEqual(`{
  a {
    ... on A {
      myprop
    }
  }
}`);
  });

  it('inlines nested fragments', () => {
    const doc = parse(`query {
  a {
    propA
    ...A
  }
}
fragment A on A {
  propA
  propB {
    ...B
  }
}
fragment B on B {
  propC
}`);
    const [query] = doc.definitions.filter(isOperationDefinitionNode);
    const [A, B] = doc.definitions.filter(isFragmentDefinitionNode);
    const inlined = inlineFragments(query, new Map(Object.entries({ A, B })));
    expect(print(inlined)).toEqual(`{
  a {
    propA
    ... on A {
      propA
      propB {
        ... on B {
          propC
        }
      }
    }
  }
}`);
  });
});
