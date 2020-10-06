// Because we used ts-node in gatsby-config.js, this file will automatically be
// imported by Gatsby instead of gatsby-node.js.

import { ForkTsCheckerWebpackPlugin } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPlugin';
// Use the type definitions that are included with Gatsby.
import { GatsbyNode } from 'gatsby';
import { resolve as pathResolve } from 'path';

export const onCreateWebpackConfig: GatsbyNode['onCreateWebpackConfig'] = ({
  stage,
  actions,
}) => {
  if (stage !== 'develop') {
    return;
  }

  actions.setWebpackConfig({
    plugins: [
      // This webpack plugin runs type-checking and linting in parallel
      new ForkTsCheckerWebpackPlugin({
        eslint: {
          enabled: true,
          files: '**/*.{js,jsx,ts,tsx}',
        },
        typescript: {
          mode: 'write-references',
          diagnosticOptions: {
            semantic: true,
            syntactic: true,
          },
        },
      }),
    ],
  });
};

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
  reporter,
}) => {
  const { createPage } = actions;

  // By querying the GraphQL source, Gatsby is able to generate static pages
  // whose URLs are dynamically determined at build time.
  // https://www.gatsbyjs.org/docs/creating-and-modifying-pages/

  const allDocs = await graphql<AllDocsQuery>(`
    query AllDocs {
      allMdx {
        edges {
          node {
            id
            frontmatter {
              path
            }
          }
        }
      }
    }
  `);

  if (allDocs.errors) {
    reporter.panicOnBuild(
      `Error while running allDocs GraphQL query in gatsby-node.`,
      allDocs.errors,
    );
    return;
  }

  allDocs.data?.allMdx.edges.forEach(({ node }) => {
    createPage<{ id: string }>({
      path: node.frontmatter?.path || '/',
      component: pathResolve(`./src/templates/documentation.tsx`),
      context: {
        id: node.id,
      },
    });
  });
};
