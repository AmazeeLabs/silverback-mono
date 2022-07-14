import { program } from 'commander';
import { mergeWith } from 'lodash';

import { analyzeOperations, analyzeSchemas } from './analyze';
import { scanDocuments } from './input';

program.name('estimator');
program.command('analyze').action(() => {
  const doc = scanDocuments(process.cwd());
  const schemas = analyzeSchemas(doc, [
    'editorBlock',
    'resolveEditorBlocks',
    'resolveEditorBlockAttribute',
    'entity',
    'menu',
    'resolveMenuItems',
    'resolveMenuItemId',
    'resolveMenuItemParentId',
    'resolveMenuItemLabel',
    'resolveMenuItemUrl',
    'isPath',
    'path',
    'template',
    'isTemplate',
    'resolveEntityPath',
    'resolveProperty',
    'property',
    'resolveEntityReference',
    'resolveEntityReferenceRevisions',
    'stringTranslation',
  ]);
  const operations = analyzeOperations(doc);
  console.table(mergeWith(schemas, operations, (a, b) => a || 0 + b || 0));
});

program.parse();
