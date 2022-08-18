type QueryName = string;
type QueryHash = string;
type QueryMap = Record<QueryName, QueryHash>;
type Fetch = typeof fetch;

export const withPersistedQueries = (
  fetchFunc: Fetch,
  queryMap: QueryMap,
): Fetch => {
  return function (url, init) {
    if (typeof url !== 'string') {
      throw new Error('Request URL should be a string.');
    }
    if (typeof init?.body !== 'string') {
      const message = 'Request body should be a string.';
      console.error({ message, url, init });
      throw new Error(message);
    }
    let body;
    try {
      body = JSON.parse(init.body);
    } catch (error) {
      const message = 'Cannot parse request body.';
      console.error({ message, url, init });
      throw new Error(message);
    }
    if (!body?.query || typeof body.query !== 'string') {
      const message = 'Cannot find query in request body.';
      console.error({ message, url, init, body });
      throw new Error(message);
    }
    const query: string = body.query;

    const { queryType, queryId } = getQueryData(query, queryMap);

    const params = body;
    delete params.query;
    params.id = queryId;

    if (queryType === 'mutation') {
      return fetchFunc(url, {
        ...init,
        body: JSON.stringify(params),
      });
    } else {
      return fetchFunc(addQueryParamsToUrl(url, params), {
        ...init,
        method: 'GET',
        body: undefined,
      });
    }
  };
};

export function persistedFetcher<TData, TVariables>(
  endpoint: string,
  queryMap: QueryMap,
  query: string,
  variables?: TVariables,
) {
  const { queryType, queryId } = getQueryData(query, queryMap);
  return async (): Promise<TData> => {
    const params = { id: queryId, variables };
    let res;
    if (queryType === 'mutation') {
      res = await fetch(endpoint, {
        method: 'POST',
        ...{ credentials: 'include' },
        body: JSON.stringify(params),
      });
    } else {
      res = await fetch(addQueryParamsToUrl(endpoint, params), {
        method: 'GET',
        ...{ credentials: 'include' },
      });
    }
    const json = await res.json();
    if (json.errors) {
      const { message } = json.errors[0];
      throw new Error(message);
    }
    return json.data;
  };
}

type QueryType = 'query' | 'mutation';
function getQueryData(
  query: string,
  queryMap: QueryMap,
): {
  queryType: QueryType;
  queryId: string;
} {
  const match = query.match(/((query)|(mutation)) ([A-Za-z0-9_]+)[ {(]/);
  if (!match) {
    throw new Error(`Cannot find query type and name. Query: ${query}`);
  }
  const queryType: QueryType = match[1] as QueryType;
  const queryName = match[4];

  const queryId = queryMap[queryName];
  if (!queryId) {
    throw new Error(
      `Cannot find query ID. Query name: ${queryName}. Query map: ${JSON.stringify(
        queryMap,
      )}`,
    );
  }

  return { queryId, queryType };
}

function addQueryParamsToUrl(
  url: string,
  params: { id: string; variables?: any },
): string {
  return (
    url +
    '?' +
    new URLSearchParams({
      id: params.id,
      ...(typeof params.variables !== 'undefined'
        ? { variables: JSON.stringify(params.variables) }
        : {}),
    }).toString()
  );
}
