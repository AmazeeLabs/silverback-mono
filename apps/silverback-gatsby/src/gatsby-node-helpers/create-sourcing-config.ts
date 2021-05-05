import { SourceNodesArgs } from 'gatsby';
import {
  buildNodeDefinitions,
  compileNodeQueries,
  generateDefaultFragments,
  loadSchema,
} from 'gatsby-graphql-source-toolkit';
import {
  IGatsbyNodeConfig,
  ISourcingConfig,
} from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';
import { drupalNodes } from './drupal-nodes';

export const createSourcingConfig = async (
  gatsbyApi: SourceNodesArgs,
): Promise<ISourcingConfig> => {
  const execute = createQueryExecutor();
  const schema = await loadSchema(execute);

  // Instruct gatsby-graphql-source-toolkit how to fetch content from Drupal.
  // The LIST_ queries are used to fetch the content when there is no cache. The
  // NODE_ queries are used to fetch incremental updates.
  // More details in https://github.com/gatsbyjs/gatsby-graphql-toolkit#readme
  const gatsbyNodeTypes: IGatsbyNodeConfig[] = [];
  for (const drupalNode of drupalNodes) {
    gatsbyNodeTypes.push({
      remoteTypeName: drupalNode.type,
      queries: `
        query LIST_${drupalNode.type} {
          ${drupalNode.multiple}(
            limit: $limit
            offset: $offset
          ) {
            ..._${drupalNode.type}Id_
          }
        }
        query NODE_${drupalNode.type} {
          ${drupalNode.single}(id: $id) {
            ..._${drupalNode.type}Id_
          }
        }
        fragment _${drupalNode.type}Id_ on ${drupalNode.type} {
          __typename
          id
        }
      `,
    });
  }

  const fragments = await generateDefaultFragments({
    schema,
    gatsbyNodeTypes,
  });

  const documents = compileNodeQueries({
    schema,
    gatsbyNodeTypes,
    customFragments: fragments,
  });

  return {
    gatsbyApi,
    schema,
    execute,
    // The default typename transformer adds a prefix to all remote types. It
    // can be set to empty string, but then make sure that type names do not
    // clash with Gatsby.
    gatsbyTypePrefix: 'Drupal',
    gatsbyNodeDefs: buildNodeDefinitions({ gatsbyNodeTypes, documents }),
  };
};
