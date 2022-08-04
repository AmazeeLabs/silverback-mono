import { NodePluginArgs } from 'gatsby';
import {
  buildNodeDefinitions,
  compileNodeQueries,
  generateDefaultFragments,
  IPaginationAdapter,
  loadSchema,
} from 'gatsby-graphql-source-toolkit';
import {
  IGatsbyNodeConfig,
  IQueryExecutor,
  ISourcingConfig,
} from 'gatsby-graphql-source-toolkit/dist/types';

import { Options } from '../utils';
import { drupalFeeds as drupalFeedsFetcher } from './drupal-feeds';
import { createLimitOffsetPaginationAdapter } from './pagination-adapter';

type UntranslatableListResultItem = {
  remoteTypeName: string;
};

type TranslatableListResultItem = UntranslatableListResultItem & {
  translations: Array<ListResultItem>;
};

type ListResultItem =
  | UntranslatableListResultItem
  | TranslatableListResultItem
  | null;

type ITranslatablePaginationAdapter = IPaginationAdapter<
  ListResultItem[],
  ListResultItem
>;

export const createSourcingConfig = async (
  gatsbyApi: NodePluginArgs,
  execute: IQueryExecutor,
  options: Options,
): Promise<ISourcingConfig> => {
  const schema = await loadSchema(execute);
  const drupalFeeds = await drupalFeedsFetcher(execute);

  const isTranslatable = (
    item: ListResultItem,
  ): item is TranslatableListResultItem =>
    drupalFeeds.filter(
      (feed) => feed.typeName === item?.remoteTypeName && feed.translatable,
    ).length > 0;
  // Instruct gatsby-graphql-source-toolkit how to fetch content from Drupal.
  // The LIST_ queries are used to fetch the content when there is no cache. The
  // NODE_ queries are used to fetch incremental updates.
  // More details in https://github.com/gatsbyjs/gatsby-graphql-toolkit#readme
  const gatsbyNodeTypes: IGatsbyNodeConfig[] = [];
  for (const feed of drupalFeeds) {
    gatsbyNodeTypes.push({
      remoteTypeName: feed.typeName,
      queries: `
        query LIST_${feed.typeName} {
          ${feed.listFieldName}(
            limit: $limit
            offset: $offset
          ) {
            __typename
            ${
              feed.translatable
                ? `translations {
                     ..._${feed.typeName}Id_
                   }`
                : `..._${feed.typeName}Id_`
            }
          }
        }
        query NODE_${feed.typeName} {
          ${feed.singleFieldName}(id: $id) {
            ..._${feed.typeName}Id_
          }
        }
        fragment _${feed.typeName}Id_ on ${feed.typeName} {
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

  const LimitOffsetTranslatable: ITranslatablePaginationAdapter = {
    ...(createLimitOffsetPaginationAdapter(
      options.paginator_page_size || 100,
    ) as ITranslatablePaginationAdapter),
    getItems: (pageOrResult) => {
      return pageOrResult
        .map((node) => (isTranslatable(node) ? node.translations : [node]))
        .reduce((acc, val) => acc.concat(val), []);
    },
  };

  return {
    gatsbyApi,
    schema,
    execute,
    paginationAdapters: [LimitOffsetTranslatable],
    gatsbyTypePrefix: 'Drupal',
    gatsbyNodeDefs: buildNodeDefinitions({ gatsbyNodeTypes, documents }),
  };
};
