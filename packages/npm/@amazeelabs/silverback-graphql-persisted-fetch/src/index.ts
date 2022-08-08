type QueryHash = string;
type Query = string;
type Fetch = typeof fetch;

export const withPersistedQueries = (
  fetchFunc: Fetch,
  map: Record<QueryHash, Query>,
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
    const entry = Object.entries(map).find(([, query]) => query.includes(name));
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
