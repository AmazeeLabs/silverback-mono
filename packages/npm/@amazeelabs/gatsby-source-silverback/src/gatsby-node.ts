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
  deleteNodes,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';
import { INodeDeleteEvent } from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './helpers/create-query-executor';
import { createSourcingConfig } from './helpers/create-sourcing-config';
import { createTranslationQueryField } from './helpers/create-translation-query-field';
import { drupalNodes } from './helpers/drupal-nodes';
import { fetchNodeChanges } from './helpers/fetch-node-changes';

type Options = {
  // The url of the Drupal installation.
  drupal_url: string;
  // The Drupal GraphQL server path.
  graphql_path: string;
  // Optional Basic Auth Drupal user.
  auth_user?: string;
  // Optional Basic Auth Drupal password.
  auth_pass?: string;
};

export const pluginOptionsSchema: GatsbyNode['pluginOptionsSchema'] = ({
  Joi,
}) =>
  Joi.object<Options>({
    drupal_url: Joi.string().uri({ allowRelative: false }).required(),
    graphql_path: Joi.string().uri({ relativeOnly: true }).required(),
    auth_user: Joi.string().optional(),
    auth_pass: Joi.string().optional(),
  });

const validOptions = (options: { [key: string]: any }): options is Options =>
  options.drupal_url && options.graphql_path;

const apiUrl = (options: Options) =>
  `${new URL(options.drupal_url).origin}${options.graphql_path}`;

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  gatsbyApi: SourceNodesArgs & { webhookBody?: { buildId?: number } },
  options,
) => {
  if (!validOptions(options)) {
    return;
  }

  const executor = createQueryExecutor(
    apiUrl(options),
    options.auth_user,
    options.auth_pass,
  );
  // TODO: Accept configuration and fragment overrides from plugin settings.
  const config = await createSourcingConfig(gatsbyApi, executor);
  const context = createSourcingContext(config);
  await createToolkitSchemaCustomization(config);

  // Source only what was changed. If there is something in cache.
  const lastBuildId = await gatsbyApi.cache.get(`LAST_BUILD_ID`);
  let currentBuildId = gatsbyApi.webhookBody?.buildId || -1;

  if (currentBuildId === -1) {
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

  // If the current build is lower than the last one, the CMS has been reset and we
  // need to re-fetch everything. If the two are equal, this is a manual request, in which
  // case we also re-fetch all data.
  if (currentBuildId <= lastBuildId || !lastBuildId) {
    gatsbyApi.reporter.info(`ℹ️ clearing all nodes.`);
    const feeds = await drupalNodes(executor);
    for (const feed of feeds) {
      const nodes = gatsbyApi.getNodesByType(`Drupal${feed.type}`);
      const events: Array<INodeDeleteEvent> = nodes.map((node) => ({
        remoteTypeName: feed.type,
        eventName: 'DELETE',
        remoteId: { id: node.id },
      }));
      deleteNodes(context, events);
    }
    currentBuildId = -1;
  }

  if (!lastBuildId || lastBuildId === -1 || currentBuildId === -1) {
    // If we don't have a last build or the CMS has not information about the
    // latest build, there is no way to detect changes. We have to run a full
    // rebuild.
    gatsbyApi.reporter.info(`ℹ️ sourceNodes will fetch all nodes.`);
    await sourceAllNodes(config);
    gatsbyApi.reporter.info(`sourced data for build ${currentBuildId}`);
    await gatsbyApi.cache.set(`LAST_BUILD_ID_TMP`, currentBuildId);
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
            executor,
          )
        : [];

    await sourceNodeChanges(config, { nodeEvents });
    await gatsbyApi.cache.set(`LAST_BUILD_ID_TMP`, currentBuildId);
  }
};

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async (args: CreateSchemaCustomizationArgs, options) => {
    if (!validOptions(options)) {
      return;
    }

    await createTranslationQueryField(
      args,
      createQueryExecutor(
        apiUrl(options),
        options.auth_user,
        options.auth_pass,
      ),
    );
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
