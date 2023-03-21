import type { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { print, visit } from 'graphql/language';
import { concatAST } from 'graphql/utilities';

function isNotEmpty<T>(obj: T | undefined): obj is T {
  return obj !== undefined;
}

export const plugin: PluginFunction = (schema, documents) => {
  const fragments: Array<string> = [];
  const allAst = concatAST(
    documents.map(({ document }) => document).filter(isNotEmpty),
  );
  visit(allAst, {
    FragmentDefinition(node) {
      fragments.push(print(node));
    },
  });
  return `const {graphql} = require('gatsby');const fragments = graphql\`${fragments.join(
    '\n',
  )}\`;export { fragments };`;
};
