import { createDefaultQueryExecutor } from 'gatsby-graphql-source-toolkit';

export const createQueryExecutor = (
  url: string,
  authUser?: string,
  authPass?: string,
  authKey?: string,
  headers?: RequestInit['headers'],
) => {
  return createDefaultQueryExecutor(url, {
    ...headers,
    ...(!!authUser && !!authPass
      ? {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${authUser}:${authPass}`,
            ).toString('base64')}`,
          },
        }
      : {}),
    ...(authKey ? { 'api-key': authKey } : {}),
  });
};
