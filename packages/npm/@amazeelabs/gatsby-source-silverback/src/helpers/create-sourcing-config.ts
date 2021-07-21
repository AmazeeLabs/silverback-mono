import { SourceNodesArgs } from 'gatsby';
import {
  buildNodeDefinitions,
  compileNodeQueries,
  generateDefaultFragments,
  IPaginationAdapter,
  LimitOffset,
  loadSchema,
} from 'gatsby-graphql-source-toolkit';
import {
  IGatsbyNodeConfig,
  IQueryExecutor,
  ISourcingConfig,
  RemoteTypeName,
} from 'gatsby-graphql-source-toolkit/dist/types';

import { drupalNodes as drupalNodesFetcher } from './drupal-nodes';

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
  gatsbyApi: SourceNodesArgs,
  execute: IQueryExecutor,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars-experimental
  customFragments?: Map<RemoteTypeName, string>,
): Promise<ISourcingConfig> => {
  const schema = await loadSchema(execute);
  const drupalNodes = await drupalNodesFetcher(execute);

  const isTranslatable = (
    item: ListResultItem,
  ): item is TranslatableListResultItem =>
    drupalNodes.filter(
      (def) => def.type === item?.remoteTypeName && def.translatable,
    ).length > 0;
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
            __typename
            ${
              drupalNode.translatable
                ? `translations {
                     ..._${drupalNode.type}Id_
                   }`
                : `..._${drupalNode.type}Id_`
            }
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

  const LimitOffsetTranslatable: ITranslatablePaginationAdapter = {
    ...(LimitOffset as ITranslatablePaginationAdapter),
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
    // The default typename transformer adds a prefix to all remote types. It
    // can be set to empty string, but then make sure that type names do not
    // clash with Gatsby.
    gatsbyTypePrefix: 'Drupal',
    gatsbyNodeDefs: buildNodeDefinitions({ gatsbyNodeTypes, documents }),
  };
};
