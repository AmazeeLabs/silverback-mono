import { PluginObj, PluginPass, types } from '@babel/core';
import { readFileSync } from 'fs';

function loadOperations(path: string) {
  const loadedOperations: Record<string, string> = {};
  const loaded = JSON.parse(readFileSync(path).toString());
  Object.keys(loaded).forEach((key) => {
    loadedOperations[key.split(':')[0]] = loaded[key];
  });
  return loadedOperations;
}

export default () =>
  ({
    visitor: {
      ImportDeclaration(path) {
        if (path.node.source.value === '@amazeelabs/gatsby-plugin-operations') {
          path.replaceWith(
            types.importDeclaration(
              path.node.specifiers,
              types.stringLiteral('gatsby'),
            ),
          );
          path.skip();
        }
      },
      CallExpression(path, { opts }) {
        const operations = loadOperations(opts.operations);
        if (path.node.callee.type === 'Identifier') {
          if (path.node.callee.name === 'graphql') {
            if (
              !(
                path.node.arguments.length === 1 &&
                path.node.arguments[0].type === 'Identifier'
              )
            ) {
              return;
            }
            const operation = path.node.arguments[0].name;
            if (!operation || !operations[operation]) {
              return;
            }
            path.replaceWith(
              types.taggedTemplateExpression(
                types.identifier('graphql'),
                types.templateLiteral(
                  [types.templateElement({ raw: operations[operation] })],
                  [],
                ),
              ),
            );
            path.skip();
            return;
          }
        }
      },
    },
  }) satisfies PluginObj<
    PluginPass & {
      opts: {
        operations: string;
      };
    }
  >;
