import { createDefaultQueryExecutor } from 'gatsby-graphql-source-toolkit';
import { RequestInit } from 'node-fetch';

export const createQueryExecutor = (
  url: string,
  authUser?: string,
  authPass?: string,
  authKey?: string,
  headers?: RequestInit['headers'],
) => {
  return createDefaultQueryExecutor(url, {
    headers: {
      ...headers,
      ...(authUser && authPass
        ? {
            Authorization: `Basic ${Buffer.from(
              `${authUser}:${authPass}`,
            ).toString('base64')}`,
          }
        : {}),
      ...(authKey ? { 'api-key': authKey } : {}),
    },
    timeout: 60_000,
  });
};
