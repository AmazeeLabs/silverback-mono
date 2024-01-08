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
                  _drupalId: string;
                  internal: { type: string };
                },
                args: { langcode: string },
                context,
              ) => {
                return (
                  (await context.nodeModel.findOne({
                    query: {
                      filter: {
                        _langcode: { eq: args.langcode },
                        _drupalId: { eq: source._drupalId },
                      },
                    },
                    type: source.internal.type,
                  })) ||
                  (await context.nodeModel.findOne({
                    query: {
                      filter: {
                        _defaultTranslation: { eq: true },
                        _drupalId: { eq: source._drupalId },
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
