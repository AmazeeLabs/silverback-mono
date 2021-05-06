import { createQueryExecutor } from './create-query-executor';

interface DrupalNode {
  multiple: string;
  single: string;
  changes: string;
  type: string;
}

export const drupalNodes = async (): Promise<Array<DrupalNode>> => {
  const execute = createQueryExecutor();
  const results = await execute({
    operationName: 'DrupalFeedInfo',
    query: `
    query DrupalFeedInfo {
      drupalFeedInfo {
        typeName
        translationsTypeName
        singleFieldName
        listFieldName
        changesFieldName
      }
    }
    `,
    variables: {},
  });
  return results.data?.drupalFeedInfo.map(
    (info: any) =>
      ({
        multiple: info.listFieldName,
        changes: info.changesFieldName,
        single: info.singleFieldName,
        type: info.translationsTypeName || info.typeName,
      } as DrupalNode),
  );
};
