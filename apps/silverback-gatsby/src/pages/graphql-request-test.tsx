import { withPersistedQueries } from '@amazeelabs/silverback-graphql-persisted';
import { GraphQLClient } from 'graphql-request';
import React, { useEffect, useState } from 'react';

import { GetPagesQuery, getSdk } from '../../generated/graphql-request';
import queryMap from '../../generated/persisted-queries-map.json';

const Sitemap: React.FC = () => {
  const sdk = getSdk(
    new GraphQLClient(process.env.GATSBY_GRAPHQL_ENDPOINT!, {
      fetch: withPersistedQueries(fetch, queryMap),
    }),
  );
  const [randomInt, setRandomInt] = useState<number>();
  const [pages, setPages] = useState<GetPagesQuery['queryPages']>();
  useEffect(() => {
    (async () => {
      setPages((await sdk.GetPages({ offset: 0, limit: 2 })).queryPages);
      const fetchRandomInt = async () => {
        setRandomInt((await sdk.GetRandomInt({ randomInt: 123 })).getRandomInt);
      };
      await fetchRandomInt();
      setInterval(fetchRandomInt, 1_000);
    })();
  }, []);
  return (
    <div>
      <h1>GraphQL Request test</h1>
      <div>
        Amount of loaded pages (should be 2):{' '}
        <span id="pages-count">{pages?.length}</span>
      </div>
      <div>
        Loaded random int (should change):{' '}
        <span id="random-int">{randomInt}</span>
      </div>
    </div>
  );
};

export default Sitemap;
