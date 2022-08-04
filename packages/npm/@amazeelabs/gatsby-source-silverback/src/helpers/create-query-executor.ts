import { wrapQueryExecutorWithQueue } from 'gatsby-graphql-source-toolkit';
import { IQueryExecutor } from 'gatsby-graphql-source-toolkit/dist/types';
import fetch, { RequestInit } from 'node-fetch';
import { inspect } from 'util';

export const createQueryExecutor = (
  url: string,
  authUser?: string,
  authPass?: string,
  authKey?: string,
  headers?: RequestInit['headers'],
) => {
  const executor = createNetworkQueryExecutor(url, {
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
  return wrapQueryExecutorWithQueue(executor, { concurrency: 10 });
};

// Copy of the default network query executor from gatsby-graphql-source-toolkit
// package with improved error handling.
// https://github.com/gatsbyjs/gatsby-graphql-toolkit/blob/7ba8b24d8524254dc6c2853d6d014070befd9aea/src/config/query-executor.ts#L6-L39
export function createNetworkQueryExecutor(
  uri: string,
  fetchOptions: RequestInit = {},
): IQueryExecutor {
  return async function execute(args) {
    const { query, variables, operationName } = args;

    let response;
    try {
      response = await fetch(uri, {
        method: 'POST',
        body: JSON.stringify({ query, variables, operationName }),
        ...fetchOptions,
        headers: {
          'Content-Type': 'application/json',
          ...fetchOptions.headers,
        },
      });
    } catch (e) {
      console.warn(
        `Query ${operationName} failed.\n` +
          `Query variables: ${inspect(variables)}\n` +
          `Full query: ${inspect(query)}\n`,
      );
      throw e;
    }
    if (!response.ok) {
      console.warn(
        `Query ${operationName} returned status ${response.status}.\n` +
          `Query variables: ${inspect(variables)}\n` +
          `Full query: ${inspect(query)}\n`,
      );
    }
    const result = await response.json();

    if (result.data && result.errors?.length) {
      console.warn(
        `Query ${operationName} returned warnings:\n` +
          `${inspect(result.errors)}\n` +
          `Query variables: ${inspect(variables)}\n` +
          `Full query: ${inspect(query)}\n`,
      );
    }
    return result;
  };
}
