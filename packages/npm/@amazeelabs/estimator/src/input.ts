import { gqlPluckFromCodeStringSync } from '@graphql-tools/graphql-tag-pluck';
import { existsSync, lstatSync, readFileSync } from 'fs';
import { sync } from 'glob';
import { isArray } from 'lodash';
import path from 'path';

/**
 * Scan a directory for *.gql, *.graphqls, *.graphql or *.ts files containing
 * schema definitions or fragments.
 *
 * @param documents
 *   A single or multiple paths leading to either files or directories that will
 *   be scanned.
 *
 * @return string
 *   A concatenated string with all GraphQL documents found.
 */
export function scanDocuments(documents: Array<string> | string): string {
  return (isArray(documents) ? documents : [documents])
    .map((document) => {
      if (!existsSync(document)) {
        return '';
      }

      const globOpts = {
        absolute: true,
        cwd: document,
      } as Parameters<typeof sync>[1];

      const files = lstatSync(document).isDirectory()
        ? [
            ...sync('./**/*.gql', globOpts),
            ...sync('./**/*.graphqls', globOpts),
            ...sync('./**/*.graphql', globOpts),
            ...sync('./**/*.ts', globOpts),
            ...sync('./**/*.tsx', globOpts),
          ]
        : [path.resolve(process.cwd(), document)];

      const docs = files.map((name) => {
        return name.match(/\.tsx?$/)
          ? gqlPluckFromCodeStringSync(name, readFileSync(name, 'utf-8'))
              .map((source) => source.body)
              .join('\n')
          : readFileSync(name, 'utf-8');
      });
      return docs.join('\n');
    })
    .join('\n');
}
