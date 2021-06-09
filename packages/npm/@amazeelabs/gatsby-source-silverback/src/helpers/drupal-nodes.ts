import { createQueryExecutor } from './create-query-executor';

interface DrupalNode {
  multiple: string;
  single: string;
  type: string;
  translationType?: string;
}

export const drupalNodes = async (): Promise<Array<DrupalNode>> => {
  const execute = createQueryExecutor();
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
