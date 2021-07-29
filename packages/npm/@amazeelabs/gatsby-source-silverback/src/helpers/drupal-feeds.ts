import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

type DrupalFeed = {
  listFieldName: string;
  singleFieldName: string;
  typeName: string;
  translatable: boolean;
  pathFieldName: string | null;
  templateFieldName: string | null;
};

type FeedInfoResult = {
  data?: {
    drupalFeedInfo: Array<DrupalFeed>;
  };
};

export const drupalFeeds = async (
  execute: IQueryExecutor,
): Promise<Array<DrupalFeed>> => {
  const results = (await execute({
    operationName: 'DrupalFeedInfo',
    query: `
    query DrupalFeedInfo {
      drupalFeedInfo {
        typeName
        translatable
        singleFieldName
        listFieldName
        pathFieldName
        templateFieldName
      }
    }
    `,
    variables: {},
  })) as FeedInfoResult;

  if (!results.data) {
    throw new Error(
      `Cannot fetch Drupal feed information: ${JSON.stringify(
        results,
        null,
        2,
      )}`,
    );
  }

  return results.data.drupalFeedInfo || [];
};
