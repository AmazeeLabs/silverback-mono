import { CreateSchemaCustomizationArgs } from 'gatsby';
import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

import { drupalFeeds } from './drupal-feeds';

export const createTranslationQueryField = async (
  { actions, schema }: CreateSchemaCustomizationArgs,
  execute: IQueryExecutor,
) => {
  // Attach new fields to all translatable Drupal types.
  // - translation: retrieve a specific translation
  actions.createTypes(
    (await drupalFeeds(execute))
      .filter((feed) => feed.translatable)
      .map((feed) =>
        schema.buildObjectType({
          name: `Drupal${feed.typeName}`,
          fields: {
            translation: {
              type: `Drupal${feed.typeName}!`,
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
                  (await context.nodeModel.runQuery({
                    query: {
                      filter: {
                        langcode: { eq: args.langcode },
                        drupalId: { eq: source.drupalId },
                      },
                    },
                    type: source.internal.type,
                    firstOnly: true,
                  })) ||
                  (await context.nodeModel.runQuery({
                    query: {
                      filter: {
                        defaultTranslation: { eq: true },
                        drupalId: { eq: source.drupalId },
                      },
                    },
                    type: source.internal.type,
                    firstOnly: true,
                  }))
                );
              },
            },
          },
        }),
      ),
  );
};
