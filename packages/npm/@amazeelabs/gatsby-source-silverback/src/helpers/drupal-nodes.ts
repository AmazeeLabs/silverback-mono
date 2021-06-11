import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';

interface DrupalNode {
  multiple: string;
  single: string;
  type: string;
  translationType?: string;
}

export const drupalNodes = async (
  execute: IQueryExecutor,
): Promise<Array<DrupalNode>> => {
  const results = await execute({
    operationName: 'DrupalFeedInfo',
    query: `
    query DrupalFeedInfo {
      drupalFeedInfo {
        typeName
        translationTypeName
        singleFieldName
        listFieldName
      }
    }
    `,
    variables: {},
  });
  return results.data?.drupalFeedInfo.map(
    (info: {
      listFieldName: string;
      singleFieldName: string;
      typeName: string;
      translationTypeName?: string;
    }) =>
      ({
        multiple: info.listFieldName,
        single: info.singleFieldName,
        type: info.typeName,
        translationType: info.translationTypeName,
      } as DrupalNode),
  );
};
