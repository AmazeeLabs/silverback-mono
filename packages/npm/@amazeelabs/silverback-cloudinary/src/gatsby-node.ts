import {
  CreateSchemaCustomizationArgs,
  GatsbyNode,
} from 'gatsby';

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async (args: CreateSchemaCustomizationArgs) => {
    //console.log('In cloudinary2');
    //console.dir(args, {depth: 4});
    //args.actions
    //args.actions.createTypes(`
    //type Query {
    //  testQuery: Int!
    //}
    //`);
  };

