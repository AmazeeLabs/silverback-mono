import { PluginFunction } from '@graphql-codegen/plugin-helpers';
import { readFileSync } from 'fs';
import { resolve } from 'path';

type Config = { map: string; endpoint: string; fetchParams?: string };

export const plugin: PluginFunction<Config> = (_, __, config) => {
  const getEndpoint = (): string => {
    try {
      new URL(config.endpoint);
      return JSON.stringify(config.endpoint);
    } catch (e) {
      throw `The endpoint "${config.endpoint}" is not a valid URL: ${e}`;
    }
  };

  const getMap = (): string => {
    return readFileSync(resolve(process.cwd(), config.map)).toString();
  };

  // The fetcher base code is taken from the original "fetch" fetcher.
  // https://github.com/dotansimha/graphql-code-generator/blob/05404dfd3a31ae3c923abc2b5943e3dde7e42ff6/packages/plugins/typescript/react-query/src/fetcher-fetch.ts#L17-L35
  return `
    export function fetcher<TData, TVariables>(query: string, variables?: TVariables) {
      const map = ${getMap()};
      const match = query.match(/((query)|(mutation)) [A-Za-z0-9_]+[ {(]/);
      if (!match) {
        throw new Error(\`Cannot find query name. Query: $\{query}\`);
      }
      const name = match[0];
      const entry = Object.entries(map).find(([_, query]) => query.includes(name));
      if (!entry) {
        throw new Error(\`Cannot find query ID. Query name: $\{name}. Query map: $\{JSON.stringify(map)}\`);
      }
      const id = entry[0];
      return async (): Promise<TData> => {
        const res = await fetch(${getEndpoint()}, {
          method: "POST",
          ${
            config.fetchParams
              ? `...(${JSON.stringify(config.fetchParams)}),`
              : ''
          }
          body: JSON.stringify({ id, variables }),
        });
        const json = await res.json();
        if (json.errors) {
          const { message } = json.errors[0];
          throw new Error(message);
        }
        return json.data;
      }
    }
  `;
};

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
