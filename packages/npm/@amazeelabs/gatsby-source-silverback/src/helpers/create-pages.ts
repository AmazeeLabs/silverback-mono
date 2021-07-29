import fs from 'fs';
import { CreatePagesArgs, PluginOptions } from 'gatsby';

import { SilverbackPageContext } from '../../types';
import { apiUrl, validOptions } from '../utils';
import { createQueryExecutor } from './create-query-executor';
import { drupalFeeds } from './drupal-feeds';

export const createPages = async (
  args: CreatePagesArgs,
  options: PluginOptions,
) => {
  if (!validOptions(options)) {
    return;
  }
  const executor = createQueryExecutor(
    apiUrl(options),
    options.auth_user,
    options.auth_pass,
  );
  const feeds = await drupalFeeds(executor);
  for (const feed of feeds) {
    if (!feed.pathFieldName) {
      continue;
    }
    const { data, errors } = await args.graphql<{
      list: {
        nodes: Array<{
          typeName: string;
          id: string;
          remoteId: string;
          path: string | null;
          template?: string | null;
        }>;
      };
    }>(`
          query {
            list: allDrupal${feed.typeName} {
              nodes {
                typeName: __typename
                id
                remoteId
                path: ${feed.pathFieldName}
                ${
                  feed.templateFieldName
                    ? `template: ${feed.templateFieldName}`
                    : ''
                }
              }
            }
          }
        `);
    if (!data) {
      console.error('errors', errors);
      throw new Error(
        `Cannot fetch create-page fields for "${feed.typeName}" type from Gatsby.`,
      );
    }
    data.list.nodes.forEach((node) => {
      if (!node.path) {
        return;
      }

      const { typeName, id, remoteId, path } = node;
      const [, locale] = remoteId.split(':');
      const template =
        node.template ||
        // Generate the template name from the type.
        // E.g. "BlogPost" => "blog-post".
        feed.typeName.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
      const context: SilverbackPageContext = {
        typeName,
        id,
        remoteId,
        locale,
      };

      const templatesPath = `${
        args.store.getState().program.directory
      }/src/templates`;
      const templatePath = `${templatesPath}/${template}.tsx`;
      if (fs.existsSync(templatePath)) {
        args.actions.createPage({
          path,
          component: require.resolve(templatePath),
          context,
        });
      } else {
        args.reporter.warn(
          `Could not find "${template}.tsx" template in "${templatesPath}" directory. The stub template will be used for node "${node.remoteId}" of type "${feed.typeName}" on "${path}" path.`,
        );
        args.actions.createPage({
          path,
          component: require.resolve(`${__dirname}/../templates/stub.js`),
          context: { ...context, expectedTemplatePath: templatePath },
        });
      }
    });
  }
};
