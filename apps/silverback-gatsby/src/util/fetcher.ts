import { persistedFetcher } from '@amazeelabs/silverback-graphql-persisted';

import queryMap from '../../generated/persisted-queries-map.json';

export function fetcher<TData, TVariables>(
  query: string,
  variables?: TVariables,
): () => Promise<TData> {
  return persistedFetcher(
    process.env.GATSBY_GRAPHQL_ENDPOINT!,
    queryMap,
    query,
    variables,
  );
}
