import { program } from 'commander';
import { readFileSync } from 'fs';
import { mergeWith } from 'lodash';

import { analyzeOperations, analyzeSchemas } from './analyze';
import { scanDirectory } from './input';

program.name('estimator');
program.command('analyze').action(() => {
  const files = scanDirectory(process.cwd());
  const docs = files.map((name) => readFileSync(name).toString());
  const schemas = analyzeSchemas(docs, [
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
  const operations = analyzeOperations(docs);
  console.table(mergeWith(schemas, operations, (a, b) => a || 0 + b || 0));
});

program.parse();
