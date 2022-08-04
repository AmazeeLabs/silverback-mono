import fs from 'fs';
import { CreatePagesArgs, PluginOptions } from 'gatsby';

import { SilverbackPageContext } from '../../types';
import { validOptions } from '../utils';
import { createQueryExecutor } from './create-query-executor';
import { drupalFeeds } from './drupal-feeds';

export const createPages = async (
  args: CreatePagesArgs,
  options: PluginOptions,
) => {
  if (!validOptions(options)) {
    return;
  }
  const executor = createQueryExecutor(options);
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
          localizations?: Array<{
            path: string | null;
            locale: string;
          }>;
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
                ${
                  feed.translatable
                    ? `localizations: translations {
                         path: ${feed.pathFieldName}
                         locale: langcode
                       }`
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
        localizations: node.localizations?.filter(
          (it): it is { path: string; locale: string } => !!it.path,
        ),
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
