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
