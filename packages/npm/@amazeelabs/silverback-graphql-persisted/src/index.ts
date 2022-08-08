type QueryName = string;
type QueryHash = string;
type Fetch = typeof fetch;

/**
 * To be used with @graphql-codegen/typescript-graphql-request
 *
 * Example:
 *   import { withPersistedQueries } from '@amazeelabs/silverback-graphql-persisted';
 *   import map from '../generated/client-map.json';
 *   const sdk = getSdk(
 *     new GraphQLClient(..., {
 *       ...,
 *       fetch: withPersistedQueries(fetch, map),
 *     }),
 *   );
 */
export const withPersistedQueries = (
  fetchFunc: Fetch,
  queryMap: Record<QueryName, QueryHash>,
): Fetch => {
  return function (input, init) {
    if (typeof init?.body !== 'string') {
      const message = 'Request body should be a string.';
      console.error({ message, input, init });
      throw new Error(message);
    }
    let body;
    try {
      body = JSON.parse(init.body);
    } catch (error) {
      const message = 'Cannot parse request body.';
      console.error({ message, input, init });
      throw new Error(message);
    }
    if (!body?.query || typeof body.query !== 'string') {
      const message = 'Cannot find query in request body.';
      console.error({ message, input, init, body });
      throw new Error(message);
    }
    const query: string = body.query;

    const match = query.match(/((query)|(mutation)) [A-Za-z0-9_]+[ {(]/);
    if (!match) {
      const message = 'Cannot find query name.';
      console.error({ message, input, init, body, query });
      throw new Error(message);
    }
    const name = match[0];
    const entry = Object.entries(queryMap).find(([, query]) =>
      query.includes(name),
    );
    if (!entry) {
      const message = 'Cannot find query ID.';
      console.error({ message, input, init, body, query, name });
      throw new Error(message);
    }
    const id = entry[0];

    return fetchFunc(input, {
      ...init,
      body: JSON.stringify({
        ...body,
        query: undefined,
        id,
      }),
    });
  };
};

/**
 * To be used with @graphql-codegen/typescript-react-query
 *
 * Example:
 *   import { persistedFetcher } from '@amazeelabs/silverback-graphql-persisted';
 *   import map from '../generated/client-map.json';
 *   export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
 *     return persistedFetcher(endpoint, map, query, variables);
 *   }
 */
export function persistedFetcher<TData, TVariables>(
  endpoint: string,
  queryMap: Record<QueryName, QueryHash>,
  query: string,
  variables?: TVariables,
) {
  const match = query.match(/((query)|(mutation)) [A-Za-z0-9_]+[ {(]/);
  if (!match) {
    throw new Error(`Cannot find query name. Query: ${query}`);
  }
  const name = match[0];
  const id = queryMap[name];
  if (!id) {
    throw new Error(
      `Cannot find query ID. Query name: ${name}. Query map: ${JSON.stringify(
        queryMap,
      )}`,
    );
  }
  return async (): Promise<TData> => {
    const res = await fetch(endpoint, {
      method: 'POST',
      ...{ credentials: 'include' },
      body: JSON.stringify({ id, variables }),
    });
    const json = await res.json();
    if (json.errors) {
      const { message } = json.errors[0];
      throw new Error(message);
    }
    return json.data;
  };
}
