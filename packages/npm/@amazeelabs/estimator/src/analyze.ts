import {
  ConstDirectiveNode,
  DirectiveNode,
  FieldsOnCorrectTypeRule,
  Kind,
  OperationTypeNode,
  parse,
  SelectionSetNode,
  TypeNode,
} from 'graphql';
import { extend, isArray, merge, mergeWith, reduce } from 'lodash';

const schemaProperties = {
  /**
   * Definition of a query (root-level) field.
   *
   * - implement a custom resolver
   * - fetch data from an arbitrary data source
   */
  QUERY_FIELD_DEFINITION: 0,

  /**
   * Definition of a mutation (root-level) field.
   *
   * - implement a custom resolver
   * - implement security mechanisms / authentication
   * - api level error handling
   */
  MUTATION_FIELD_DEFINITION: 0,

  /**
   * Definition of a subscription field.
   *
   * - requires streaming server architecture
   */
  SUBSCRIPTION_FIELD_DEFINITION: 0,

  /**
   * Define an object type of unknown storage.
   *
   * - nothing to do, assumes that the object is already fetched
   * - complexity in fields is dealt with there
   */
  OBJECT_DEFINITION: 0,

  /**
   * Arbitrary object field.
   *
   * - implement a resolver that retrieves data from the current parent value
   */
  OBJECT_FIELD_DEFINITION: 0,

  /**
   * Definition of an argument on any field.
   *
   * - massage the argument and pass it to the resolver.
   */
  FIELD_ARGUMENT_DEFINITION: 0,

  /**
   * Interface defintion
   *
   * - implement a type resolver for this interface
   */
  INTERFACE_DEFINITION: 0,

  /**
   * Union defintion
   *
   * - implement a type resolver for this union
   */
  UNION_DEFINITION: 0,

  /**
   * Definition of a custom input type
   *
   * - more complex data massaging, passing to resolvers
   * - more complext state handlign in the frontend
   */
  INPUT_DEFINITION: 0,

  /**
   * Definition of a field on a custom input type
   *
   * - more complex data massaging, passing to resolvers
   */
  INPUT_FIELD_DEFINITION: 0,
};

const operationProperties = {
  /**
   * A query operation that gets executed by the frontend.
   *
   * - invocation in the frontend code
   * - mapping data
   * - error handling
   * - result state management
   */
  QUERY_OPERATION: 0,

  /**
   * A mutation operation that gets executed by the frontend.
   *
   * - invocation in the frontend code
   * - mapping data
   * - error handling
   * - operation state management
   * - result state management
   */
  MUTATION_OPERATION: 0,

  /**
   * Declaration of a variable used by Query, Mutation or Subscription.
   *
   * - provide user interface for setting parameters (e.g. filter form, search field ...)
   * - manage state in the frontend
   */
  VARIABLE_DECLARATION: 0,

  /**
   * A subscription operation that gets executed by the frontend.
   *
   * - invocation in the frontend code
   * - mapping data
   * - error handling
   * - operation state management
   * - result state management
   * - stream handling
   */
  SUBSCRIPTION_OPERATION: 0,

  /**
   * Declaration of a new query fragment, sub-selection, inline fragment.
   *
   * - create a new react component to display the data
   * - deal with a complex property
   */
  FRAGMENT_DECLARATION: 0,

  /**
   * A sub-selection on a complex field return type.
   *
   * - handle more complex data in the UI
   */
  SUBSELECTION_DECLARATION: 0,

  /**
   * An inline fragment on a complex field return type.
   *
   * - handle more complex data in the UI
   * - probably different types in a list
   * - should very likely be a fragment declaration
   */
  INLINE_FRAGMENT_DECLARATION: 0,

  /**
   * Invocation of a field in a query or fragment.
   *
   * - accept data and display it in the UI component
   */
  FIELD_INVOCATION: 0,
};

const typePenalties = {
  /**
   * Penalty for lists in return types, arguments or variables.
   *
   * - deal with multiple values in the UI component
   * - deal with the empty state
   */
  LIST_TYPE: 0,

  /**
   * Penalty for nullable return types, arguments or variables.
   *
   * - deal with null values in the UI
   */
  NULLABLE_TYPE: 0,
};

/**
 * Usage of relevant directives within schema documents.
 *
 * If a directive is found on an element, it will be counted **instead** of the defintion
 * of the element itself.
 */
type DirectiveResults = Record<string, number>;

type SchemaResults = typeof schemaProperties &
  typeof typePenalties &
  DirectiveResults;

type OperationResults = typeof operationProperties &
  typeof typePenalties &
  DirectiveResults;

export function analyzeSchemas(
  documents: string | Array<string>,
  directives: Array<string> = [],
): SchemaResults {
  const result = {
    ...schemaProperties,
    ...typePenalties,
    ...directives
      .map((dir) => ({ [dir]: 0 }))
      .reduce((acc, val) => ({ ...acc, ...val }), {}),
  } as SchemaResults;

  // Count penalties for nullable and list return types.
  function countTypePenalties(
    type: TypeNode,
    nonNullAble: Boolean = false,
  ): void {
    if (type.kind !== Kind.NON_NULL_TYPE && !nonNullAble) {
      result.NULLABLE_TYPE++;
    }
    if (type.kind === Kind.NON_NULL_TYPE) {
      countTypePenalties(type.type, true);
    }
    if (type.kind === Kind.LIST_TYPE) {
      result.LIST_TYPE++;
      countTypePenalties(type.type);
    }
  }

  /**
   * Check for matching directive definitions, count them and return the status.
   *
   * @param directives Array of directive nodes on an AST element.
   * @returns boolean True if a directive was counted.
   */
  function matchDirectives(directives?: ReadonlyArray<ConstDirectiveNode>) {
    const matchingDirectives = directives
      ?.map((dir) => dir.name.value)
      .filter((dir) => Object.keys(result).includes(dir));

    if (matchingDirectives?.length) {
      matchingDirectives.forEach((dir) => result[dir]++);
      return true;
    }
    return false;
  }

  (isArray(documents) ? documents : [documents]).forEach((doc) => {
    let ast;
    try {
      ast = parse(doc);
    } catch (exc) {
      console.error(exc);
      return result;
    }

    ast.definitions.forEach((def) => {
      if (
        def.kind === Kind.OBJECT_TYPE_DEFINITION ||
        def.kind === Kind.OBJECT_TYPE_EXTENSION
      ) {
        // Count object type definitions, except root level types.
        if (
          def.kind === Kind.OBJECT_TYPE_DEFINITION &&
          !['Query', 'Mutation', 'Subscription'].includes(def.name.value)
        ) {
          // Check if the type contains a known directive
          // and simply increment that one instead.
          if (matchDirectives(def.directives)) {
            return;
          }
          result.OBJECT_DEFINITION++;
        }

        // Collect field defnitions on types.
        def.fields?.forEach((field) => {
          // Check if the field contains a known directive
          // and simply increment that one instead.
          if (matchDirectives(field.directives)) {
            return;
          }

          switch (def.name.value) {
            case 'Query':
              result.QUERY_FIELD_DEFINITION++;
              break;
            case 'Mutation':
              result.MUTATION_FIELD_DEFINITION++;
              break;
            case 'Subscription':
              result.SUBSCRIPTION_FIELD_DEFINITION++;
              break;
            default:
              result.OBJECT_FIELD_DEFINITION++;
          }

          // Count argument definitions.
          field.arguments?.forEach((arg) => {
            countTypePenalties(arg.type);
            result.FIELD_ARGUMENT_DEFINITION++;
          });

          countTypePenalties(field.type);
        });
      }

      // Count interface definitions.
      if (
        def.kind === Kind.INTERFACE_TYPE_DEFINITION &&
        !matchDirectives(def.directives)
      ) {
        result.INTERFACE_DEFINITION++;
      }

      // Count union type definitions.
      if (
        def.kind === Kind.UNION_TYPE_DEFINITION &&
        !matchDirectives(def.directives)
      ) {
        result.UNION_DEFINITION++;
      }

      // Count input types and fields on them.
      if (
        def.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION ||
        def.kind === Kind.INPUT_OBJECT_TYPE_EXTENSION
      ) {
        if (def.kind === Kind.INPUT_OBJECT_TYPE_DEFINITION) {
          result.INPUT_DEFINITION++;
        }
        def.fields?.forEach((field) => {
          result.INPUT_FIELD_DEFINITION++;
          countTypePenalties(field.type);
        });
      }
    });
  });

  return result;
}

export function analyzeOperations(
  documents: string | Array<string>,
): OperationResults {
  const result = {
    ...operationProperties,
    ...typePenalties,
  } as OperationResults;

  // Count penalties for nullable and list return types.
  function countTypePenalties(
    type: TypeNode,
    nonNullAble: Boolean = false,
  ): void {
    if (type.kind !== Kind.NON_NULL_TYPE && !nonNullAble) {
      result.NULLABLE_TYPE++;
    }
    if (type.kind === Kind.NON_NULL_TYPE) {
      countTypePenalties(type.type, true);
    }
    if (type.kind === Kind.LIST_TYPE) {
      result.LIST_TYPE++;
      countTypePenalties(type.type);
    }
  }

  // Recursively count selections.
  function countSelections(
    selectionSet?: SelectionSetNode,
    sub: boolean = false,
  ) {
    if (sub && selectionSet) {
      result.SUBSELECTION_DECLARATION++;
    }

    selectionSet?.selections.forEach((sel) => {
      if (sel.kind === Kind.FIELD) {
        result.FIELD_INVOCATION++;
        countSelections(sel.selectionSet, true);
      }
      if (sel.kind === Kind.INLINE_FRAGMENT) {
        result.INLINE_FRAGMENT_DECLARATION++;
        countSelections(sel.selectionSet);
      }
    });
  }

  (isArray(documents) ? documents : [documents]).forEach((doc) => {
    let ast;
    try {
      ast = parse(doc);
    } catch (exc) {
      console.error(exc);
      return result;
    }

    ast.definitions.forEach((def) => {
      // Count operations.
      if (def.kind === Kind.OPERATION_DEFINITION) {
        switch (def.operation) {
          case OperationTypeNode.QUERY:
            result.QUERY_OPERATION++;
            break;
          case OperationTypeNode.MUTATION:
            result.MUTATION_OPERATION++;
            break;
          case OperationTypeNode.SUBSCRIPTION:
            result.SUBSCRIPTION_OPERATION++;
            break;
        }
        def.variableDefinitions?.forEach((variable) => {
          result.VARIABLE_DECLARATION++;
          countTypePenalties(variable.type);
        });
        countSelections(def.selectionSet);
      }

      // Count fragment declarations.
      if (def.kind === Kind.FRAGMENT_DEFINITION) {
        result.FRAGMENT_DECLARATION++;
        countSelections(def.selectionSet);
      }
    });
  });

  return result;
}
