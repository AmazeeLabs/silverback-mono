// Because we used ts-node in gatsby-config.js, this file will automatically be
// imported by Gatsby instead of gatsby-node.js.

import { ForkTsCheckerWebpackPlugin } from 'fork-ts-checker-webpack-plugin/lib/ForkTsCheckerWebpackPlugin';
// Use the type definitions that are included with Gatsby.
import { GatsbyNode } from 'gatsby';

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
