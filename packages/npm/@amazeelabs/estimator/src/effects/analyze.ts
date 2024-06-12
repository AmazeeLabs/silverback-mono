import { Effect } from 'effect';
import { ConstDirectiveNode, SelectionSetNode, TypeNode } from 'graphql';
import { DocumentNode } from 'graphql/language';

import { aggregate } from './aggregate.js';
import { configuration } from './configuration.js';
import { extract } from './extract.js';
import { scan } from './scan.js';

class Counter {
  public counts: Record<string, number> = {};

  public inc(key: string, amount = 1) {
    this.counts[key] = (this.counts[key] || 0) + amount;
  }
}

function countListTypes(type: TypeNode): number {
  if (type.kind === 'ListType') {
    return 1 + countListTypes(type.type);
  }
  if (type.kind === 'NonNullType') {
    return countListTypes(type.type);
  }
  return 0;
}

function countNullableTypes(type: TypeNode): number {
  if (type.kind === 'ListType') {
    return countNullableTypes(type.type) + 1;
  }
  if (type.kind === 'NonNullType') {
    return countNullableTypes(type.type) - 1;
  }
  return 1;
}

function countFieldInvocations(selection: SelectionSetNode): number {
  return selection.selections.reduce((acc, selection) => {
    if (selection.kind === 'Field') {
      if (selection.selectionSet) {
        return acc + countFieldInvocations(selection.selectionSet) + 1;
      } else {
        return acc + 1;
      }
    }
    if (selection.kind === 'InlineFragment') {
      return acc + countFieldInvocations(selection.selectionSet);
    }
    return acc;
  }, 0);
}

function countSubSelections(selection: SelectionSetNode): number {
  return selection.selections.reduce((acc, selection) => {
    if (selection.kind === 'Field' && selection.selectionSet) {
      return acc + countSubSelections(selection.selectionSet) + 1;
    }
    return 0;
  }, 0);
}

function countInlineFragments(selection: SelectionSetNode): number {
  return selection.selections.reduce((acc, selection) => {
    if (selection.kind === 'Field' && selection.selectionSet) {
      return acc + countInlineFragments(selection.selectionSet);
    }
    if (selection.kind === 'InlineFragment') {
      return acc + countInlineFragments(selection.selectionSet) + 1;
    }
    return 0;
  }, 0);
}

function matchDirectives(
  directives: readonly ConstDirectiveNode[] | undefined,
  weights: Record<string, number>,
): string | undefined {
  if (directives) {
    const knownDirectives = Object.keys(weights);
    let directiveName: string | undefined;
    for (const directive of directives) {
      if (
        knownDirectives.includes(directive.name.value) &&
        (!directiveName ||
          weights[directive.name.value] > weights[directiveName])
      ) {
        directiveName = directive.name.value;
      }
    }
    return directiveName;
  }
  return undefined;
}

/**
 * Analyze a GraphQL document and count occurrence of different patterns.
 * @param document
 */
export const analyze = (document: DocumentNode) =>
  Effect.gen(function* () {
    const counter = new Counter();
    const directives = (yield* configuration).weights.directives;
    document.definitions.forEach((definition) => {
      if (definition.kind === 'ObjectTypeDefinition') {
        if (
          !['Query', 'Mutation', 'Subscription'].includes(definition.name.value)
        ) {
          const directive = matchDirectives(definition.directives, directives);
          if (directive) {
            counter.inc(directive);
          } else {
            counter.inc('OBJECT_DEFINITION');
          }
        }
      }
      if (
        definition.kind === 'ObjectTypeDefinition' ||
        definition.kind === 'ObjectTypeExtension'
      ) {
        definition.fields?.forEach((field) => {
          const directive = matchDirectives(field.directives, directives);
          if (directive) {
            counter.inc(directive);
            return;
          }
          counter.inc('NULLABLE_TYPE', countNullableTypes(field.type));
          counter.inc('LIST_TYPE', countListTypes(field.type));
          field.arguments?.forEach((arg) => {
            counter.inc('FIELD_ARGUMENT_DEFINITION');
            counter.inc('NULLABLE_TYPE', countNullableTypes(arg.type));
            counter.inc('LIST_TYPE', countListTypes(arg.type));
          });

          switch (definition.name.value) {
            case 'Query':
              counter.inc('QUERY_FIELD_DEFINITION');
              break;
            case 'Mutation':
              counter.inc('MUTATION_FIELD_DEFINITION');
              break;
            case 'Subscription':
              counter.inc('SUBSCRIPTION_FIELD_DEFINITION');
              break;
            default:
              counter.inc('OBJECT_FIELD_DEFINITION');
              break;
          }
        });
      }

      if (definition.kind === 'InterfaceTypeDefinition') {
        const directive = matchDirectives(definition.directives, directives);
        if (directive) {
          counter.inc(directive);
        } else {
          counter.inc('INTERFACE_DEFINITION');
        }
      }
      if (definition.kind === 'UnionTypeDefinition') {
        const directive = matchDirectives(definition.directives, directives);
        if (directive) {
          counter.inc(directive);
        } else {
          counter.inc('UNION_DEFINITION');
        }
      }

      if (definition.kind === 'InputObjectTypeDefinition') {
        counter.inc('INPUT_DEFINITION');
      }

      if (
        definition.kind === 'InputObjectTypeDefinition' ||
        definition.kind === 'InputObjectTypeExtension'
      ) {
        definition.fields?.forEach((field) => {
          counter.inc('INPUT_FIELD_DEFINITION');
          counter.inc('NULLABLE_TYPE', countNullableTypes(field.type));
          counter.inc('LIST_TYPE', countListTypes(field.type));
        });
      }

      if (definition.kind === 'OperationDefinition') {
        if (definition.operation === 'query') {
          counter.inc('QUERY_OPERATION');
        }
        if (definition.operation === 'mutation') {
          counter.inc('MUTATION_OPERATION');
        }
        if (definition.operation === 'subscription') {
          counter.inc('SUBSCRIPTION_OPERATION');
        }

        definition.variableDefinitions?.forEach(() => {
          counter.inc('VARIABLE_DECLARATION');
        });

        definition.selectionSet.selections.forEach(() => {
          counter.inc(
            'FIELD_INVOCATION',
            countFieldInvocations(definition.selectionSet),
          );
          counter.inc(
            'SUBSELECTION_DECLARATION',
            countSubSelections(definition.selectionSet),
          );
          counter.inc(
            'INLINE_FRAGMENT_DECLARATION',
            countInlineFragments(definition.selectionSet),
          );
        });
      }

      if (definition.kind === 'FragmentDefinition') {
        counter.inc('FRAGMENT_DECLARATION');
        counter.inc(
          'FIELD_INVOCATION',
          countFieldInvocations(definition.selectionSet),
        );
        counter.inc(
          'SUBSELECTION_DECLARATION',
          countSubSelections(definition.selectionSet),
        );
        counter.inc(
          'INLINE_FRAGMENT_DECLARATION',
          countInlineFragments(definition.selectionSet),
        );
      }
    });
    return counter.counts;
  });

export const analyzeFile = (file: string) =>
  Effect.gen(function* () {
    const documents = yield* extract(file);
    const results = yield* Effect.forEach(documents, analyze);
    return yield* aggregate(results);
  });

export const analyzeProject = Effect.gen(function* () {
  const files = yield* scan;
  const results = yield* Effect.forEach(files, analyzeFile, {
    concurrency: 5,
  });
  return yield* aggregate(results);
});
