import { IPaginationAdapter } from 'gatsby-graphql-source-toolkit/dist/config/pagination-adapters/types';

// A copy of LimitOffset pagination adapter adjusted for Drupal GraphQL v3.
export const createPaginationAdapter = (): IPaginationAdapter<
  unknown[],
  unknown
> => {
  // The standard adapter expects the top field field to contain an array of
  // nodes. But Drupal GraphQL v3 returns { entities: Entity[] } in most cases.
  const getIterable = (data: object): unknown[] => {
    if (Array.isArray(data)) {
      return data;
    }
    for (const prop of Object.values(data)) {
      if (Array.isArray(prop)) {
        return prop;
      }
    }
    throw new Error('Cannot find an iterable property.');
  };

  // The standard adapter uses 100, but in Drupal entities might be very heavy.
  const defaultLimit = 20;

  return {
    name: 'LimitOffsetDrupalGraphQLv3',
    expectedVariableNames: ['limit', 'offset'],
    start() {
      return {
        variables: { limit: defaultLimit, offset: 0 },
        hasNextPage: true,
      };
    },
    next(state, page) {
      const limit = Number(state.variables.limit) ?? defaultLimit;
      const offset = Number(state.variables.offset) + limit;
      return {
        variables: { limit, offset },
        hasNextPage: getIterable(page).length === limit,
      };
    },
    concat(result, page) {
      return result.concat(page);
    },
    getItems(pageOrResult) {
      return getIterable(pageOrResult);
    },
  };
};
