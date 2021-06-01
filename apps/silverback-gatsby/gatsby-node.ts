import { GatsbyNode } from 'gatsby';

import { createArticlePages } from './src/gatsby-node-helpers/create-pages/articles';
import { createGutenbergPages } from './src/gatsby-node-helpers/create-pages/gutenberg-pages';

export type CreatePagesArgs = Parameters<
  Required<GatsbyNode>['createPages']
>[0];

export const createPages: GatsbyNode['createPages'] = async (args) => {
  await createArticlePages(args);
  await createGutenbergPages(args);
};
