import fs from 'fs';
import { CreatePagesArgs, PluginOptions } from 'gatsby';
import { dirname, resolve } from 'path';

import { SilverbackPageContext } from '../types.js';
import { typePrefix, validOptions } from '../utils.js';
import { createQueryExecutor } from './create-query-executor.js';
import { drupalFeeds } from './drupal-feeds.js';

const createCampaignRedirects = async (
  args: CreatePagesArgs,
  options: PluginOptions,
) => {
  if (!validOptions(options)) {
    return;
  }
  const { data, errors } = await args.graphql<{
    list: {
      nodes: Array<{
        source: string;
        destination: string;
        statusCode: number;
        force: boolean;
      }>;
    };
  }>(`
    query {
      list: all${typePrefix(options)}CampaignUrl {
        nodes {
          source
          destination
          statusCode
          force
        }
      }
    }
  `);
  if (!data) {
    console.error('errors', errors);
    throw new Error(`Cannot fetch campaign url fields from Gatsby.`);
  }

  data.list.nodes.forEach((node) => {
    args.actions.createRedirect({
      fromPath: node.source,
      toPath: node.destination,
      isPermanent: true,
      force: node.force,
      statusCode: node.statusCode,
    });
  });
};

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
    // For campaign urls, we actually just want to create redirects instead of
    // actual pages.
    if (feed.typeName === 'CampaignUrl') {
      createCampaignRedirects(args, options);
      continue;
    }

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
            list: all${typePrefix(options)}${feed.typeName} {
              nodes {
                typeName: __typename
                id:_id
                remoteId:_id
                path: ${feed.pathFieldName}
                ${
                  feed.templateFieldName
                    ? `template: ${feed.templateFieldName}`
                    : ''
                }
                ${
                  feed.translatable
                    ? `localizations: _translations {
                         path: ${feed.pathFieldName}
                         locale: _langcode
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
          component: resolve(templatePath),
          context,
        });
      } else {
        args.reporter.warn(
          `Could not find "${template}.tsx" template in "${templatesPath}" directory. The stub template will be used for node "${node.remoteId}" of type "${feed.typeName}" on "${path}" path.`,
        );
        args.actions.createPage({
          path,
          component: resolve(
            `${dirname(
              new URL(import.meta.url).pathname,
            )}/../templates/stub.js`,
          ),
          context: { ...context, expectedTemplatePath: templatePath },
        });
      }
    });
  }
};
