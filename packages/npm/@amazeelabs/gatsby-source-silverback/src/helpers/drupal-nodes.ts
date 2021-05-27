import { createQueryExecutor } from './create-query-executor';

interface DrupalNode {
  multiple: string;
  single: string;
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
        singleFieldName
        listFieldName
      }
    }
    `,
    variables: {},
  });
  return results.data?.drupalFeedInfo.map(
    (info: any) =>
      ({
        multiple: info.listFieldName,
        single: info.singleFieldName,
        type: info.typeName,
      } as DrupalNode),
  );
};
