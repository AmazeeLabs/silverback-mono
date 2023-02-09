import {
  CreateSchemaCustomizationArgs,
  GatsbyGraphQLObjectType,
  GatsbyNode
} from 'gatsby';

import { resolveResponsiveImage } from './responsive_image';

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  (args: CreateSchemaCustomizationArgs) => {
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
  ]);
  // For every field which is of type DrupalResponsiveImage, we need to add the
  // config parameter, because right now that parameter is not added by
  // gatsby-graphql-source-toolkit. So, besides adding the resolver for the
  // field, we also add the config input parameter.
  // When gatsby-graphql-source-toolkit will add the field parameters (and maybe
  // also the input types), then parts of the code bellow and the entire code
  // above could be removed.
  const responsiveImages: Array<GatsbyGraphQLObjectType> = [];
  args.store.getState().schemaCustomization.types.map((schemaType: any) => {
    // If the type def does not have a config or fields (for example unions), we
    // are not interested in altering anything.
    if (typeof schemaType.typeOrTypeDef.config === 'undefined' ||
        typeof schemaType.typeOrTypeDef.config.fields === 'undefined') {
      return;
    }
    const fieldsObject = schemaType.typeOrTypeDef.config.fields;
    Object.entries(fieldsObject).map(([fieldKey, ]) => {
      if (fieldsObject[fieldKey].type === 'DrupalResponsiveImage' || fieldsObject[fieldKey].type === 'DrupalResponsiveImage!') {
        responsiveImages.push(args.schema.buildObjectType({
          name: schemaType.typeOrTypeDef.config.name,
          fields: {
            [fieldKey]: {
              type: fieldsObject[fieldKey].type,
              args: {
                config: {
                  type: 'ResponsiveImageConfig',
                },
              },
              resolve: (
                source,
                args,
              ) => {
                return resolveResponsiveImage(source[fieldKey].src, args.config);
              },
            },
          },
        }));
      }
    });
  });
  if (responsiveImages.length > 0) {
    args.actions.createTypes(responsiveImages);
  }
};
