import { GatsbyNode } from 'gatsby';

export const createPages: GatsbyNode['createPages'] = async ({
  actions,
  graphql,
}) => {
  const rawRedirects = await graphql<{
    allDrupalRawRedirect?: {
      nodes?: Array<{
        source: string;
        destination: string;
        statusCode: number;
        force: boolean;
      }>;
    };
  }>(`
    query RawRedirects {
      allDrupalRawRedirect {
        nodes {
          source
          destination
          statusCode
          force
        }
      }
    }
  `);

  if (rawRedirects.errors) {
    throw rawRedirects.errors;
  }

  if (rawRedirects.data?.allDrupalRawRedirect?.nodes?.length) {
    rawRedirects.data?.allDrupalRawRedirect?.nodes.map((redirect) => {
      actions.createRedirect({
        fromPath: redirect.source,
        toPath: redirect.destination,
        isPermanent: true,
        force: redirect.force,
        statusCode: redirect.statusCode,
      });
    });
  }
};
