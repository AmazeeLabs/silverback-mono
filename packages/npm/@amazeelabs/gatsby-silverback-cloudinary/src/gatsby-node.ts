import {
  CreateSchemaCustomizationArgs,
  GatsbyGraphQLObjectType,
  GatsbyNode
} from 'gatsby';

import { resolveResponsiveImage } from './index';

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async (args: CreateSchemaCustomizationArgs, options) => {
    const responsiveImageResultType = options.responsiveImageResultType || 'ResponsiveImage';
    const responsiveImageFields = options.responsiveImageFields || [];
    const reporter = args.reporter;
    // The resolver will need these credentials, so let's check here if we have
    // them defined.
    if (typeof process.env.CLOUDINARY_API_SECRET === 'undefined' ||
        typeof process.env.CLOUDINARY_API_KEY === 'undefined' ||
        typeof process.env.CLOUDINARY_CLOUDNAME === 'undefined') {
          reporter.error('Cloudinary credentials are not defined! You will not be able to use the service. The original image(s) will be used instead.');
    }
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
        const fullFieldName = `${schemaType.typeOrTypeDef.config.name}.${fieldKey}`;
        if (fieldsObject[fieldKey].type === responsiveImageResultType ||
           fieldsObject[fieldKey].type === `${responsiveImageResultType}!` ||
           // @ts-ignore
           responsiveImageFields.includes(fullFieldName)) {
          responsiveImages.push(args.schema.buildObjectType({
            name: schemaType.typeOrTypeDef.config.name,
            fields: {
              [fieldKey]: {
                type: fieldsObject[fieldKey].type,
                args: {
                  width: {
                    type: 'Int',
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
                },
                resolve: (
                  source,
                  args,
                ) => {
                  try {
                    const imageData = JSON.parse(source[fieldKey]);
                    return resolveResponsiveImage(imageData.src, {width: args.width, height: args.height, sizes: args.sizes, transform: args.transform});
                  } catch (e) {
                    // @ts-ignore
                    reporter.error(e);
                    return JSON.stringify({});
                  }
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
