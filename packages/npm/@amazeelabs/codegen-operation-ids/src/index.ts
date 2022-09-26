import { oldVisit, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
import { pascalCase } from 'change-case-all';
import crypto from 'crypto';
import {
  concatAST,
  FragmentDefinitionNode,
  OperationDefinitionNode,
  print,
  visit,
} from 'graphql';

class OperationIdVisitor extends ClientSideBaseVisitor {
  _extractFragments() {
    return [];
  }
  OperationDefinition(node: OperationDefinitionNode) {
    this._collectedOperations.push(node);
    const operationType = pascalCase(node.operation);
    const operationTypeSuffix = this.getOperationSuffix(node, operationType);
    const operationResultType = this.convertName(node, {
      suffix: operationTypeSuffix + this._parsedConfig.operationResultSuffix,
    });
    const operationVariablesTypes = this.convertName(node, {
      suffix: operationTypeSuffix + 'Variables',
    });
    const hasRequiredVariables = this.checkVariablesRequirements(node);

    return `export const ${operationResultType} = "${queryId(
      node,
    )}" as OperationId<${operationResultType},${operationVariablesTypes}${
      hasRequiredVariables ? '' : ' | undefined'
    }>;`;
  }
}

function queryId(node: OperationDefinitionNode) {
  return `${node.name?.value ?? 'anonymous'}:${crypto
    .createHash('sha256')
    .update(print(node))
    .digest('hex')}`;
}

function listUsedFragments(
  node: OperationDefinitionNode | FragmentDefinitionNode,
  fragmentMap: Map<string, FragmentDefinitionNode>,
) {
  const fragments = new Set<string>();
  visit(node, {
    FragmentSpread(spread) {
      fragments.add(spread.name.value);
      const fragmentNode = fragmentMap.get(spread.name.value);
      if (fragmentNode) {
        listUsedFragments(fragmentNode, fragmentMap).forEach((nested) => {
          fragments.add(nested);
        });
      }
    },
  });
  return fragments;
}

export const plugin: PluginFunction<any, string> = async (
  schema,
  documents,
  config,
  info,
) => {
  const outputMap = info?.outputFile?.match(/\.json$/);

  function isNotEmpty<T extends any>(obj: T | undefined): obj is T {
    return obj !== undefined;
  }

  const allAst = concatAST(
    documents.map(({ document }) => document).filter(isNotEmpty),
  );

  const fragmentMap = new Map<string, FragmentDefinitionNode>();
  visit(allAst, {
    FragmentDefinition(node) {
      fragmentMap.set(node.name.value, node);
    },
  });

  const operationMap = new Map<string, string>();
  const idMap = new Map<string, string>();
  visit(allAst, {
    OperationDefinition(node) {
      const query = [print(node)];
      listUsedFragments(node, fragmentMap).forEach((fragment) => {
        const fragmentNode = fragmentMap.get(fragment);
        if (fragmentNode) {
          query.push(print(fragmentNode));
        }
      });
      const id = queryId(node);
      operationMap.set(id, query.join('\n'));
      if (node.name) {
        idMap.set(node.name.value, id);
      }
    },
  });

  if (outputMap) {
    return JSON.stringify(Object.fromEntries(operationMap));
  }

  const document = [
    `declare const OperationId: unique symbol;

type OperationId<
  TQueryResult extends any,
  TQueryVariables extends any,
> = string & {
  _opaque: typeof OperationId;
  ___query_result: TQueryResult;
  ___query_variables: TQueryVariables;
};

export type AnyOperationId = OperationId<any, any>;

export type OperationResult<TQueryID extends OperationId<any, any>> =
  TQueryID['___query_result'];

export type OperationVariables<TQueryID extends OperationId<any, any>> =
  TQueryID['___query_variables'];`,
  ];

  const visitor = new OperationIdVisitor(schema, [], config, {}, documents);
  const visitorResult = oldVisit(allAst, { leave: visitor });
  return [
    ...document,
    ...visitorResult.definitions.filter((def: any) => typeof def === 'string'),
  ].join('\n');
};
