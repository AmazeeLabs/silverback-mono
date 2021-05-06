import { SourceNodesArgs } from 'gatsby';
import {
  createSchemaCustomization,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';

import { createSourcingConfig } from './helpers/create-sourcing-config';
import { fetchNodeChanges } from './helpers/fetch-node-changes';

export const sourceNodes = async (gatsbyApi: SourceNodesArgs) => {
  // TODO: Accept configuration and fragment overrides from plugin settings.
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
      gatsbyApi.reporter,
    );
    await sourceNodeChanges(config, { nodeEvents });
  } else {
    console.log(`ℹ️ sourceNodes will fetch all nodes.`);
    await sourceAllNodes(config);
  }
  await gatsbyApi.cache.set(`LAST_BUILD_TIME`, now);
};
