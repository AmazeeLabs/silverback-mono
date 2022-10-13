import React, { useEffect, useState } from 'react';

import {
  AnyOperationId,
  GetPagesQuery,
  GetRandomIntMutation,
  OperationResult,
  OperationVariables,
} from '../../generated/operations';

async function graphqlFetch<T extends AnyOperationId>(
  id: T,
  variables: OperationVariables<T>,
  method: 'GET' | 'POST' = 'GET',
): Promise<OperationResult<T>> {
  if (method === 'GET') {
    const url = new URL(process.env.GATSBY_GRAPHQL_ENDPOINT!);
    url.searchParams.set('id', id);
    url.searchParams.set('variables', JSON.stringify(variables));
    return (
      await (
        await fetch(url.toString(), {
          credentials: 'include',
        })
      ).json()
    ).data;
  } else {
    return await (
      await (
        await fetch(process.env.GATSBY_GRAPHQL_ENDPOINT!, {
          method: 'POST',
          body: JSON.stringify({ id, variables }),
          credentials: 'include',
        })
      ).json()
    ).data;
  }
}

const Sitemap: React.FC = () => {
  const [randomInt, setRandomInt] = useState<number>();
  const [pages, setPages] =
    useState<OperationResult<typeof GetPagesQuery>['queryPages']>();
  useEffect(() => {
    (async () => {
      setPages(
        (await graphqlFetch(GetPagesQuery, { offset: 0, limit: 2 })).queryPages,
      );
      const fetchRandomInt = async () => {
        setRandomInt(
          (
            await graphqlFetch(
              GetRandomIntMutation,
              {
                randomInt: 123,
              },
              'POST',
            )
          ).getRandomInt,
        );
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
