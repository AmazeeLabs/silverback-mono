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

import { createPages as createGatsbyPages } from './helpers/create-pages';
import { createQueryExecutor } from './helpers/create-query-executor';
import { createSourcingConfig } from './helpers/create-sourcing-config';
import { createTranslationQueryField } from './helpers/create-translation-query-field';
import { drupalFeeds } from './helpers/drupal-feeds';
import { fetchNodeChanges } from './helpers/fetch-node-changes';
import { Options, typePrefix, validOptions } from './utils';

export const pluginOptionsSchema: GatsbyNode['pluginOptionsSchema'] = ({
  Joi,
}) =>
  Joi.object<Options>({
    drupal_url: Joi.string().uri({ allowRelative: false }).required(),
    graphql_path: Joi.string().uri({ relativeOnly: true }).required(),
    drupal_external_url: Joi.string().uri({ allowRelative: false }),
    auth_user: Joi.string().optional(),
    auth_pass: Joi.string().optional(),
    auth_key: Joi.string().optional(),
    query_concurrency: Joi.number().optional().min(1),
    paginator_page_size: Joi.number().optional().min(2),
    type_prefix: Joi.string().allow('').optional(),
  });

const getForwardedHeaders = (url: URL) => ({
  'X-Forwarded-Proto': url.protocol === 'https:' ? 'https' : 'http',
  'X-Forwarded-Host': url.hostname,
  'X-Forwarded-Port': url.port,
  'SLB-Forwarded-Proto': url.protocol === 'https:' ? 'https' : 'http',
  'SLB-Forwarded-Host': url.hostname,
  'SLB-Forwarded-Port': url.port,
});

export const sourceNodes: GatsbyNode['sourceNodes'] = async (
  gatsbyApi: SourceNodesArgs & { webhookBody?: { buildId?: number } },
  options,
) => {
  if (!validOptions(options)) {
    return;
  }

  const executor = createQueryExecutor({
    ...options,
    headers: options.drupal_external_url
      ? getForwardedHeaders(new URL(options.drupal_external_url))
      : undefined,
  });
  // TODO: Accept configuration and fragment overrides from plugin settings.
  const config = await createSourcingConfig(gatsbyApi, executor, options);
  const context = createSourcingContext(config);

  // Source only what was changed. If there is something in cache.
  const lastBuildId = (await gatsbyApi.cache.get(`LAST_BUILD_ID`)) || -1;
  let currentBuildId = gatsbyApi.webhookBody?.buildId || -1;

  // If the webhook did not contain a build, we attempt to fetch the
  // latest one from drupal.
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
  // case we also re-fetch all data. If we don't have a last build id, we can't trust any
  // data that is stored in Gatsby and we have to re-fetch everything anyway.
  if (
    // Current build id is lower than the last one -> out of sync with CMS, re-fetch everything
    currentBuildId < lastBuildId ||
    // No information about a current build in the CMS -> re-fetch everything
    currentBuildId === -1 ||
    // No information about the latest build in Gatsby -> re-fetch everything
    lastBuildId === -1
  ) {
    gatsbyApi.reporter.info(`ℹ️ clearing all nodes.`);
    const feeds = await drupalFeeds(executor);
    for (const feed of feeds) {
      const nodes = gatsbyApi.getNodesByType(
        `${typePrefix(options)}${feed.typeName}`,
      );
      const events: Array<INodeDeleteEvent> = nodes.map((node) => ({
        remoteTypeName: feed.typeName,
        eventName: 'DELETE',
        remoteId: { id: node.id },
      }));
      deleteNodes(context, events);
    }

    // If we don't have a last build or the CMS has not information about the
    // latest build, there is no way to detect changes. We have to run a full
    // rebuild.
    gatsbyApi.reporter.info(`ℹ️ sourceNodes will fetch all nodes.`);
    await sourceAllNodes(config);
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
  }

  gatsbyApi.reporter.info(`sourced data for build ${currentBuildId}`);
  await gatsbyApi.cache.set(`LAST_BUILD_ID_TMP`, currentBuildId);
};

export const createSchemaCustomization: GatsbyNode['createSchemaCustomization'] =
  async (args: CreateSchemaCustomizationArgs, options) => {
    if (!validOptions(options)) {
      return;
    }

    const executor = createQueryExecutor(options);
    // TODO: Accept configuration and fragment overrides from plugin settings.
    const config = await createSourcingConfig(args, executor, options);
    await createToolkitSchemaCustomization(config);

    await createTranslationQueryField(
      args,
      createQueryExecutor(options),
      options,
    );
    args.actions.createTypes(`
    type Query {
      drupalBuildId: Int!
    }
  `);
  };

export const createPages: GatsbyNode['createPages'] = async (args, options) => {
  await createGatsbyPages(args, options);

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
