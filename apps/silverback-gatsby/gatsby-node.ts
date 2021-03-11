import { GatsbyNode, SourceNodesArgs } from 'gatsby';
import {
  createSchemaCustomization,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';

import { createArticlePages } from './src/gatsby-node-helpers/create-pages/articles';
import {createGutenbergPages} from "./src/gatsby-node-helpers/create-pages/gutenberg-pages";
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

export const createPages: GatsbyNode['createPages'] = async (args) => {
  await createArticlePages(args);
  await createGutenbergPages(args);
};
