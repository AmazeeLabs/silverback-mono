import { SourceNodesArgs } from 'gatsby';
import {
  buildNodeDefinitions,
  compileNodeQueries,
  loadSchema,
  readOrGenerateDefaultFragments,
} from 'gatsby-graphql-source-toolkit';
import {
  IGatsbyNodeConfig,
  ISourcingConfig,
} from 'gatsby-graphql-source-toolkit/dist/types';

import { createPaginationAdapter } from './create-pagination-adapter';
import { createQueryExecutor } from './create-query-executor';
import { drupalNodeTypes } from './drupal-node-types';

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
  for (const [bundle, graphQlType] of Object.entries(drupalNodeTypes)) {
    gatsbyNodeTypes.push({
      remoteTypeName: graphQlType,
      queries: `
        query LIST_${graphQlType} {
          nodeQuery(limit: $limit, offset: $offset, filter: {conditions: [{field: "type", value: "${bundle}"}]}) {
            entities { ..._${graphQlType}Id_ }
          }
        }
        query NODE_${graphQlType} {
          nodeById(id: $entityId) { ..._${graphQlType}Id_ }
        }
        fragment _${graphQlType}Id_ on ${graphQlType} { __typename entityId }
      `,
    });
  }

  // Use predefined fragments. Otherwise, if generateDefaultFragments() is used,
  // gatsby-graphql-source-toolkit will prepare fragments of crazy size.
  // Example: https://gist.github.com/Leksat/25720d90644974ae7ab628d2c93c57af
  const fragments = await readOrGenerateDefaultFragments(
    './src/api-fragments',
    {
      schema,
      gatsbyNodeTypes,
    },
  );

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
    gatsbyTypePrefix: `Drupal`,
    gatsbyNodeDefs: buildNodeDefinitions({ gatsbyNodeTypes, documents }),
    // Add our custom adapter.
    paginationAdapters: [createPaginationAdapter()],
  };
};
