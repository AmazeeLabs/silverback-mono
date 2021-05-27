import fs from 'fs';
import {
  CreateResolversArgs,
  CreateSchemaCustomizationArgs,
  GatsbyNode,
  SourceNodesArgs,
} from 'gatsby';
import {
  createSchemaCustomization as createToolkitSchemaCustomization,
  createSourcingContext,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';

import { createQueryExecutor } from './helpers/create-query-executor';
import { createSourcingConfig } from './helpers/create-sourcing-config';
import { fetchNodeChanges } from './helpers/fetch-node-changes';

export const sourceNodes = async (
  gatsbyApi: SourceNodesArgs & { webhookBody?: { buildId?: number } },
) => {
  // TODO: Accept configuration and fragment overrides from plugin settings.
  const config = await createSourcingConfig(gatsbyApi);
  const context = createSourcingContext(config);
  await createToolkitSchemaCustomization(config);

  // Source only what was changed. If there is something in cache.
  const lastBuildId = await gatsbyApi.cache.get(`LAST_BUILD_ID`);
  let currentBuildId = gatsbyApi.webhookBody?.buildId || -1;

  if (currentBuildId === -1) {
    const executor = createQueryExecutor();
    const info = await executor({
      operationName: 'LatestBuildId',
      variables: {},
      query: `
      query LatestBuildId {
        drupalBuildId
      }
    `,
    });
    currentBuildId = info?.data?.drupalBuildId || -1;
  }

  if (!lastBuildId || currentBuildId === -1) {
    // If we don't have a last build or the CMS has not information about the
    // latest build, there is no way to detect changes. We have to run a full
    // rebuild.
    gatsbyApi.reporter.info(`ℹ️ sourceNodes will fetch all nodes.`);
    await gatsbyApi.cache.set(`LAST_BUILD_ID_TMP`, currentBuildId);
    await sourceAllNodes(config);
    gatsbyApi.reporter.info(`sourced data for build ${currentBuildId}`);
  } else {
    gatsbyApi.reporter.info(
      `Fetching changes between builds ${lastBuildId} and ${currentBuildId}.`,
    );

    const nodeEvents =
      lastBuildId && currentBuildId
        ? await fetchNodeChanges(
            lastBuildId,
            currentBuildId,
            gatsbyApi.reporter,
            context,
          )
        : [];

    await sourceNodeChanges(config, { nodeEvents });
    await gatsbyApi.cache.set(`LAST_BUILD_ID_TMP`, currentBuildId);
  }
};

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] = async (
  args: CreateSchemaCustomizationArgs,
) => {
  args.actions.createTypes(`
    type Query {
      drupalBuildId: Int!
    }
  `);
};

export const createPages: GatsbyNode['createPages'] = async (args) => {
  const buildId = await args.cache.get(`LAST_BUILD_ID_TMP`);
  await args.cache.set('LAST_BUILD_ID', buildId);
};

export const createResolvers: GatsbyNode['createResolvers'] = async ({
  createResolvers,
  cache,
}: CreateResolversArgs) => {
  createResolvers({
    Query: {
      drupalBuildId: {
        async resolve() {
          return (await cache.get(`LAST_BUILD_ID`)) || -1;
        },
      },
    },
  });
};

export const onPostBuild: GatsbyNode['onPostBuild'] = async (args) => {
  const data = {
    drupalBuildId: (await args.cache.get('LAST_BUILD_ID')) || -1,
  };
  const path = `${args.store.getState().program.directory}/public/build.json`;
  args.reporter.info(`Writing build information to ${path}.`);
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
};
