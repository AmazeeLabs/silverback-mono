import { CreateSchemaCustomizationArgs } from 'gatsby';
import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

import { drupalNodes } from './drupal-nodes';

export const createTranslationQueryField = async (
  { actions, schema }: CreateSchemaCustomizationArgs,
  execute: IQueryExecutor,
) => {
  // Attach new fields to all translatable Drupal types.
  // - translation: retrieve a specific translation
  actions.createTypes(
    (await drupalNodes(execute))
      .filter((drupalNode) => !!drupalNode.translationType)
      .map((drupalNode) =>
        schema.buildObjectType({
          name: `Drupal${drupalNode.type}`,
          fields: {
            translation: {
              type: `Drupal${drupalNode.translationType}!`,
              args: {
                langcode: {
                  type: 'String!',
                },
              },
              resolve: (
                source: { translations: Array<{ langcode: string }> },
                args,
              ) =>
                source.translations.find(
                  (translation) => translation.langcode === args.langcode,
                ),
            },
          },
        }),
      ),
  );
};
