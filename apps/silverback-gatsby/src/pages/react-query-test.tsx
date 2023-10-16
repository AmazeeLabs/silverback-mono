import React, { useEffect, useState } from 'react';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query';

import {
  AnyOperationId,
  GetPagesQuery,
  GetRandomIntMutation,
  OperationResult,
  OperationVariables,
} from '../../generated/operations';

function usePersistedQuery<T extends AnyOperationId>(
  id: T,
  variables: OperationVariables<T>,
  options?: Omit<
    UseQueryOptions<OperationResult<T>, any, OperationResult<T>, any>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<OperationResult<T>>(
    [id, variables],
    async () => {
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
    },
    options,
  );
}

function usePersistedMutation<T extends AnyOperationId>(
  id: T,
  options: UseMutationOptions<
    OperationResult<T>,
    unknown,
    OperationVariables<T>
  >,
) {
  return useMutation<OperationResult<T>, any, OperationVariables<T>>(
    async (variables) => {
      return (
        await (
          await fetch(process.env.GATSBY_GRAPHQL_ENDPOINT!, {
            method: 'POST',
            body: JSON.stringify({ id, variables }),
            credentials: 'include',
          })
        ).json()
      ).data;
    },
    options,
  );
}

const Sitemap: React.FC = () => {
  const [randomInt, setRandomInt] = useState<number>();
  const { data } = usePersistedQuery(GetPagesQuery, {
    offset: 0,
    limit: 2,
  });
  const { mutate } = usePersistedMutation(GetRandomIntMutation, {
    onSuccess: (data) => {
      setRandomInt(data.getRandomInt);
    },
  });
  useEffect(() => {
    const fetchRandomInt = () => mutate({ randomInt: 123 });
    fetchRandomInt();
    setInterval(fetchRandomInt, 1_000);
  }, []);
  return (
    <div>
      <h1>React Query test</h1>
      <div>
        Amount of loaded pages (should be 2):{' '}
        <span id="pages-count">{data?._queryPages.length}</span>
      </div>
      <div>
        Loaded random int (should change):{' '}
        <span id="random-int">{randomInt}</span>
      </div>
    </div>
  );
};

export default Sitemap;
