import {
  CreateSchemaCustomizationArgs,
  GatsbyNode,
} from 'gatsby';

import { resolveResponsiveImage } from './index';

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  (args: CreateSchemaCustomizationArgs) => {
  // Attach new fields to all translatable Drupal types.
  // - translation: retrieve a specific translation
  args.actions.createTypes([
    args.schema.buildInputObjectType({
      name: 'ResponsiveImageVariant',
      fields: {
        media: {
          type: 'String',
          isRequired: true,
        },
        width: {
          type: 'Int',
          isRequired: true,
        },
        height: {
          type: 'Int',
        },
        sizes: {
          type: '[[Int!]!]',
        },
        transform: {
          type: 'String',
        }
      },
    }),
    args.schema.buildInputObjectType({
      name: 'ResponsiveImageConfig',
      fields: {
        width: {
          type: 'Int',
          isRequired: true,
        },
        height: {
          type: 'Int',
        },
        sizes: {
          type: '[[Int!]!]',
        },
        transform: {
          type: 'String',
        },
        variants: {
          type: '[ResponsiveImageVariant!]'
        }
      },
    }),
    // @todo: we need to update the fields which are of type DrupalResponsiveImage
    // and just add the config arg.
    args.schema.buildObjectType({
      name: `DrupalArticle`,
      fields: {
        responsiveImage: {
          type: `DrupalResponsiveImage`,
          args: {
            config: {
              type: 'ResponsiveImageConfig',
            },
          },
          resolve: (
            source,
            args,
          ) => {
            return resolveResponsiveImage(source.responsiveImage.src, args.config);
          },
        },
      },
    })
  ]);
};
