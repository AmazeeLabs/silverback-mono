import { Node } from 'gatsby';
import { Reporter } from 'gatsby/reporter';
import { NodeEvent } from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';
import { drupalNodes as drupalNodesFetcher } from './drupal-nodes';

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
  reporter: Reporter,
): Promise<NodeEvent[]> => {
  const result: NodeEvent[] = [];
  const execute = createQueryExecutor();
  const drupalNodes = await drupalNodesFetcher();

  const getCachedIds = (type: string) =>
    (cachedNodes as ToolkitNode[])
      .filter((cachedNode) => cachedNode.remoteTypeName === type)
      .map((cachedNode) => cachedNode.remoteId);

  const changedContent = await execute({
    operationName: 'ContentChanges',
    variables: {
      since: Math.ceil(lastBuildTimeMs / 1000),
      ...drupalNodes.reduce(
        (acc, definition) => ({
          ...acc,
          [`${definition.single}Ids`]: getCachedIds(definition.type),
        }),
        {},
      ),
    },
    query: `
      query ContentChanges(
        $since: Int!
        ${drupalNodes
          .map((definition) => `$${definition.single}Ids: [String!]!`)
          .join('\n')}
      ) {
        ${drupalNodes
          .map(
            (definition) => `
              ${definition.changes}(since: $since, ids: $${definition.single}Ids) {
                type
                id
              }
        `,
          )
          .join('')}
      }
    `,
  });
  if (!changedContent.data) {
    reporter.warn(
      `Cannot fetch content updates.\n ${JSON.stringify(changedContent)}`,
    );
    throw new Error('Cannot fetch content updates.');
  }
  for (const definition of drupalNodes) {
    result.push(
      ...toNodeEvents(definition.type, changedContent.data[definition.changes]),
    );
  }

  // Report results.
  const updated = result.filter((it) => it.eventName === 'UPDATE');
  reporter.info(`ℹ️ sourceNodes will (re)fetch ${updated.length} nodes`);
  const deleted = result.filter((it) => it.eventName === 'DELETE');
  reporter.info(`ℹ️ sourceNodes will delete ${deleted.length} nodes`);

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
