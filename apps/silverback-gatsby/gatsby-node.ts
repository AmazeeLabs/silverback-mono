import { GatsbyNode, SourceNodesArgs } from 'gatsby';
import {
  createSchemaCustomization,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';

import { createSourcingConfig } from './src/gatsby-node-helpers/create-sourcing-config';
import { fetchNodeChanges } from './src/gatsby-node-helpers/fetch-node-changes';

export const sourceNodes = async (gatsbyApi: SourceNodesArgs) => {
  const config = await createSourcingConfig(gatsbyApi);
  await createSchemaCustomization(config);
  await sourceAllNodes(config);

  // Source only what was changed. If there is something in cache.
  const lastBuildTime = await gatsbyApi.cache.get(`LAST_BUILD_TIME`);
  const now = Date.now();
  if (lastBuildTime) {
    const nodeEvents = await fetchNodeChanges(
      lastBuildTime,
      gatsbyApi.getNodes(),
    );
    await sourceNodeChanges(config, { nodeEvents });
  } else {
    console.log(`ℹ️ sourceNodes will fetch all nodes.`);
    await sourceAllNodes(config);
  }
  await gatsbyApi.cache.set(`LAST_BUILD_TIME`, now);
};

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  // Create article pages. Notice that we fetch from Gatsby GraphQL, not from
  // Drupal.
  const { data, errors } = await graphql<AllArticlesQuery>(`
    query AllArticles {
      allDrupalNodeArticle {
        nodes {
          entityId
          entityLabel
          body {
            processed
          }
          fieldTags {
            entity {
              ... on DrupalTaxonomyTermTags {
                id
                entityLabel
              }
            }
          }
          fieldImage {
            entity {
              ... on DrupalMediaImage {
                fieldMediaImage {
                  alt
                }
                localImage {
                  childImageSharp {
                    fluid(maxWidth: 1920, maxHeight: 1080) {
                      base64
                      aspectRatio
                      src
                      srcSet
                      srcWebp
                      srcSetWebp
                      sizes
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `);
  if (!data) {
    console.error('errors', errors);
    throw new Error('Cannot fetch articles from Gatsby.');
  }
  data.allDrupalNodeArticle.nodes.forEach((article) => {
    actions.createPage({
      path: `/articles/${article.entityId}`,
      component: require.resolve(`./src/components/article`),
      context: { article },
    });
  });
};
