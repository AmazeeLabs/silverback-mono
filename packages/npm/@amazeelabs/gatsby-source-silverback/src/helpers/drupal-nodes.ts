import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

interface DrupalNode {
  multiple: string;
  single: string;
  type: string;
  translatable: boolean;
}

type FeedInfoResult = {
  data?: {
    drupalFeedInfo: Array<{
      listFieldName: string;
      singleFieldName: string;
      typeName: string;
      translatable: boolean;
    }>;
  };
};

export const drupalNodes = async (
  execute: IQueryExecutor,
): Promise<Array<DrupalNode>> => {
  const results = (await execute({
    operationName: 'DrupalFeedInfo',
    query: `
    query DrupalFeedInfo {
      drupalFeedInfo {
        typeName
        translatable
        singleFieldName
        listFieldName
      }
    }
    `,
    variables: {},
  })) as FeedInfoResult;
  return (
    results.data?.drupalFeedInfo.map(
      (info) =>
        ({
          multiple: info.listFieldName,
          single: info.singleFieldName,
          type: info.typeName,
          translatable: info.translatable,
        } as DrupalNode),
    ) || []
  );
};
