import { Reporter } from 'gatsby/reporter';
import { fetchNodesById } from 'gatsby-graphql-source-toolkit';
import {
  ISourcingContext,
  NodeEvent,
} from 'gatsby-graphql-source-toolkit/dist/types';

import { createQueryExecutor } from './create-query-executor';

type FeedInfoResult = {
  data?: {
    drupalFeedInfo: Array<{
      typeName: string;
      changes: Array<string>;
    }>;
  };
};

export const fetchNodeChanges = async (
  lastBuildId: number,
  currentBuildId: number,
  reporter: Reporter,
  context: ISourcingContext,
): Promise<NodeEvent[]> => {
  const result: NodeEvent[] = [];
  const execute = createQueryExecutor();

  const changedContent = (await execute({
    operationName: 'ContentChanges',
    variables: { lastBuildId, currentBuildId },
    query: `
      query ContentChanges($lastBuildId: Int!, $currentBuildId: Int!) {
        drupalFeedInfo {
          typeName
          changes(lastBuild: $lastBuildId, currentBuild: $currentBuildId)
        }
      }
    `,
  })) as FeedInfoResult;

  if (!changedContent.data) {
    reporter.warn(
      `Cannot fetch content updates.\n ${JSON.stringify(changedContent)}`,
    );
    throw new Error('Cannot fetch content updates.');
  }

  for (let i = 0; i < changedContent.data.drupalFeedInfo.length; i++) {
    const feed = changedContent.data.drupalFeedInfo[i];
    const nodes = fetchNodesById(
      context,
      feed.typeName,
      feed.changes.map((id) => ({ id })),
    );
    let index = 0;
    for await (const node of nodes) {
      result.push({
        eventName: node ? 'UPDATE' : 'DELETE',
        remoteTypeName: feed.typeName,
        remoteId: {
          __typename: feed.typeName,
          id: feed.changes[index],
        },
      });
      index++;
    }
  }

  // Report results.
  const updated = result.filter((it) => it.eventName === 'UPDATE');
  reporter.info(`ℹ️ sourceNodes will (re)fetch ${updated.length} nodes`);
  const deleted = result.filter((it) => it.eventName === 'DELETE');
  reporter.info(`ℹ️ sourceNodes will delete ${deleted.length} nodes`);

  return result;
};
