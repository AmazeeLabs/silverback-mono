import { Node } from 'gatsby';
import { NodeEvent } from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';

type ToolkitNode = Node & {
  remoteTypeName: string;
  remoteId: string;
};

interface Change {
  type: 'Update' | 'Delete';
  id: number;
}

export const fetchNodeChanges = async (
  lastBuildTimeMs: number,
  cachedNodes: Node[],
): Promise<NodeEvent[]> => {
  const result: NodeEvent[] = [];
  const execute = createQueryExecutor();

  const getCachedIds = (type: string) =>
    (cachedNodes as ToolkitNode[])
      .filter((cachedNode) => cachedNode.remoteTypeName === type)
      .map((cachedNode) => cachedNode.remoteId);

  // We could autogenerate this query from drupalNodes as in
  // createSourcingConfig(), but the code would be much less readable in this
  // case.
  const changedContent = await execute({
    operationName: 'ContentChanges',
    variables: {
      since: Math.ceil(lastBuildTimeMs / 1000),
      pageIds: getCachedIds('Page'),
      articleIds: getCachedIds('Article'),
      imageIds: getCachedIds('Image'),
      tagIds: getCachedIds('Tag'),
    },
    query: `
      query ContentChanges(
        $since: Int!
        $pageIds: [Int!]!
        $articleIds: [Int!]!
        $imageIds: [Int!]!
        $tagIds: [Int!]!
      ) {
        pageChanges(since: $since, ids: $pageIds) {
          type
          id
        }
        articleChanges(since: $since, ids: $articleIds) {
          type
          id
        }
        imageChanges(since: $since, ids: $imageIds) {
          type
          id
        }
        tagChanges(since: $since, ids: $tagIds) {
          type
          id
        }
      }
    `,
  });
  if (!changedContent.data) {
    console.error('changedContent', changedContent);
    throw new Error('Cannot fetch content updates.');
  }
  result.push(
    ...toNodeEvents('Page', changedContent.data.pageChanges),
    ...toNodeEvents('Article', changedContent.data.articleChanges),
    ...toNodeEvents('Image', changedContent.data.imageChanges),
    ...toNodeEvents('Tag', changedContent.data.tagChanges),
  );

  // Report results.
  const updated = result.filter((it) => it.eventName === 'UPDATE');
  console.log(
    `ℹ️ sourceNodes will (re)fetch ${updated.length} nodes:`,
    updated.map((it) => it.remoteId),
  );
  const deleted = result.filter((it) => it.eventName === 'DELETE');
  console.log(
    `ℹ️ sourceNodes will delete ${deleted.length} nodes:`,
    deleted.map((it) => it.remoteId),
  );

  return result;
};

const toNodeEvents = (type: string, changes: Change[]): NodeEvent[] =>
  changes.map((it) => ({
    eventName: it.type === 'Update' ? 'UPDATE' : 'DELETE',
    remoteId: {
      __typename: type,
      id: it.id,
    },
    remoteTypeName: type,
  }));
