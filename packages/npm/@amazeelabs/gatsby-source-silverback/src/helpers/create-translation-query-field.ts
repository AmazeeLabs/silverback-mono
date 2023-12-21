import { CreateSchemaCustomizationArgs } from 'gatsby';
import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

import { Options, typePrefix } from '../utils.js';
import { drupalFeeds } from './drupal-feeds.js';

export const createTranslationQueryField = async (
  { actions, schema }: CreateSchemaCustomizationArgs,
  execute: IQueryExecutor,
  options: Options,
) => {
  // Attach new fields to all translatable Drupal types.
  // - translation: retrieve a specific translation
  actions.createTypes(
    (await drupalFeeds(execute))
      .filter((feed) => feed.translatable)
      .map((feed) =>
        schema.buildObjectType({
          name: `${typePrefix(options)}${feed.typeName}`,
          fields: {
            translation: {
              type: `${typePrefix(options)}${feed.typeName}!`,
              args: {
                langcode: {
                  type: 'String!',
                },
              },
              resolve: async (
                source: {
                  drupalId: string;
                  translations: Array<{ langcode: string }>;
                  internal: { type: string };
                },
                args: { langcode: string },
                context,
              ) => {
                return (
                  (await context.nodeModel.findOne({
                    query: {
                      filter: {
                        langcode: { eq: args.langcode },
                        drupalId: { eq: source.drupalId },
                      },
                    },
                    type: source.internal.type,
                  })) ||
                  (await context.nodeModel.findOne({
                    query: {
                      filter: {
                        defaultTranslation: { eq: true },
                        drupalId: { eq: source.drupalId },
                      },
                    },
                    type: source.internal.type,
                  }))
                );
              },
            },
          },
        }),
      ),
  );
};
