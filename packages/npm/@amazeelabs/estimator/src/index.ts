import { program } from 'commander';
import { cosmiconfigSync } from 'cosmiconfig';
import { writeFileSync } from 'fs';
import { mergeWith, sum } from 'lodash';

import {
  analyzeOperations,
  analyzeSchemas,
  OperationResults,
  Properties,
  SchemaResults,
} from './analyze';
import { scanDocuments } from './input';

type Config = {
  documents: Array<string>;
  properties: {
    [key in Properties]: number;
  };
  directives: {
    [key: `${Lowercase<string>}${string}`]: number;
  };
};

const loadedConfig: Partial<Config> =
  cosmiconfigSync('estimator').search()?.config || {};

const defaultConfig: Config = {
  documents: ['graphql'],
  properties: {
    QUERY_FIELD_DEFINITION: 8,
    MUTATION_FIELD_DEFINITION: 20,
    SUBSCRIPTION_FIELD_DEFINITION: 60,
    OBJECT_DEFINITION: 4,
    OBJECT_FIELD_DEFINITION: 4,
    FIELD_ARGUMENT_DEFINITION: 6,
    INTERFACE_DEFINITION: 5,
    UNION_DEFINITION: 5,
    INPUT_DEFINITION: 4,
    INPUT_FIELD_DEFINITION: 4,
    LIST_TYPE: 4,
    NULLABLE_TYPE: 2,
    QUERY_OPERATION: 8,
    MUTATION_OPERATION: 15,
    VARIABLE_DECLARATION: 3,
    SUBSCRIPTION_OPERATION: 60,
    FRAGMENT_DECLARATION: 6,
    SUBSELECTION_DECLARATION: 1,
    INLINE_FRAGMENT_DECLARATION: 1,
    FIELD_INVOCATION: 2,
  },
  directives: {
    editorBlock: 4,
    resolveEditorBlocks: 0,
    resolveEditorBlockAttribute: 4,
    entity: 6,
    menu: 4,
    resolveMenuItems: 0,
    resolveMenuItemId: 0,
    resolveMenuItemParentId: 0,
    resolveMenuItemLabel: 0,
    resolveMenuItemUrl: 0,
    isPath: 1,
    path: 0,
    template: 10,
    isTemplate: 0,
    resolveEntityPath: 3,
    resolveProperty: 3,
    property: 3,
    resolveEntityReference: 4,
    resolveEntityReferenceRevisions: 4,
    stringTranslation: 0,
  },
};

const config = { ...defaultConfig, ...loadedConfig };

program.name('estimator');
program.command('init').action(() => {
  writeFileSync('.estimatorrc.json', JSON.stringify(defaultConfig, null, 2));
});

function isProperty(key: string): key is keyof Config['properties'] {
  return Object.keys(defaultConfig.properties).includes(key);
}

program.command('analyze').action(() => {
  const doc = scanDocuments(config.documents);
  const schemas = analyzeSchemas(doc, Object.keys(config.directives));
  const operations = analyzeOperations(doc);
  console.table(mergeWith(schemas, operations, (a, b) => a || 0 + b || 0));
});

program.command('score').action(() => {
  const doc = scanDocuments(config.documents);
  const schemaResults = analyzeSchemas(doc, Object.keys(config.directives));
  const operationResults = analyzeOperations(doc);
  const calc =
    (results: OperationResults | SchemaResults) =>
    (field: keyof OperationResults) => {
      const count = results[field];
      const weight = isProperty(field)
        ? config.properties[field]
        : config.directives[field];
      return count * weight;
    };
  const score =
    sum(Object.keys(schemaResults).map(calc(schemaResults))) +
    sum(Object.keys(operationResults).map(calc(operationResults)));
  console.log(score);
});

program.parse();
