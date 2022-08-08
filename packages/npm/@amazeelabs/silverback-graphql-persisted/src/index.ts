type QueryName = string;
type QueryHash = string;
type QueryMap = Record<QueryName, QueryHash>;
type Fetch = typeof fetch;

export const withPersistedQueries = (
  fetchFunc: Fetch,
  queryMap: QueryMap,
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

    const id = getQueryId(query, queryMap);

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

export function persistedFetcher<TData, TVariables>(
  endpoint: string,
  queryMap: QueryMap,
  query: string,
  variables?: TVariables,
) {
  const id = getQueryId(query, queryMap);
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

function getQueryId(query: string, queryMap: QueryMap): string {
  const match = query.match(/((query)|(mutation)) ([A-Za-z0-9_]+)[ {(]/);
  if (!match) {
    throw new Error(`Cannot find query name. Query: ${query}`);
  }
  const queryName = match[4];

  const id = queryMap[queryName];
  if (!id) {
    throw new Error(
      `Cannot find query ID. Query name: ${queryName}. Query map: ${JSON.stringify(
        queryMap,
      )}`,
    );
  }

  return id;
}
