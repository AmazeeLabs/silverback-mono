import { createDefaultQueryExecutor } from 'gatsby-graphql-source-toolkit';

export const createQueryExecutor = (
  url: string,
  user?: string,
  pass?: string,
  headers?: RequestInit['headers']
) => {
  return createDefaultQueryExecutor(
    url,
    {
      ...headers,
      ...(!!user && !!pass
      ? {
          headers: {
            Authorization: `Basic ${Buffer.from(`${user}:${pass}`).toString(
              'base64',
            )}`,
          },
        }
      : {})},
  );
};
