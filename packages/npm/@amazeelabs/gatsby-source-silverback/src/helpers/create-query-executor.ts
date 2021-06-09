import { createDefaultQueryExecutor } from 'gatsby-graphql-source-toolkit';
import { RequestInit } from 'node-fetch';

export const createQueryExecutor = () => {
  const fetchOptions: RequestInit =
    process.env.NODE_ENV === 'production'
      ? // Gatsby Site mode.
        {}
      : // Gatsby Preview mode.
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              process.env.DRUPAL_PREVIEW_USER_CREDENTIALS!,
            ).toString('base64')}`,
          },
        };
  return createDefaultQueryExecutor(
    process.env.DRUPAL_GRAPHQL_ENDPOINT!,
    fetchOptions,
  );
};
