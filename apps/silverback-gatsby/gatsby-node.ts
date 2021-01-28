import { GatsbyNode, SourceNodesArgs } from 'gatsby';
import {
  createSchemaCustomization,
  sourceAllNodes,
  sourceNodeChanges,
} from 'gatsby-graphql-source-toolkit';

import { languages } from './src/constants/languages';
import { createSourcingConfig } from './src/gatsby-node-helpers/create-sourcing-config';
import { fetchNodeChanges } from './src/gatsby-node-helpers/fetch-node-changes';
import { ArticleContext } from './src/types/page-context';

export const sourceNodes = async (gatsbyApi: SourceNodesArgs) => {
  const config = await createSourcingConfig(gatsbyApi);
  await createSchemaCustomization(config);
  await sourceAllNodes(config);

  // Source only what was changed. If there is something in cache.
  const lastBuildTime = await gatsbyApi.cache.get(`LAST_BUILD_TIME`);
  const now = Date.now();
  if (lastBuildTime) {
    const nodeEvents = await fetchNodeChanges(
      lastBuildTime,
      gatsbyApi.getNodes(),
    );
    await sourceNodeChanges(config, { nodeEvents });
  } else {
    console.log(`ℹ️ sourceNodes will fetch all nodes.`);
    await sourceAllNodes(config);
  }
  await gatsbyApi.cache.set(`LAST_BUILD_TIME`, now);
};

export const createPages: GatsbyNode['createPages'] = async ({
  graphql,
  actions,
}) => {
  // Create article pages. Notice that we fetch from Gatsby GraphQL, not from
  // Drupal.
  const { data, errors } = await graphql<AllArticlesQuery>(`
    query AllArticles {
      allDrupalArticle {
        nodes {
          id
          translations {
            langcode
            path
            title
            body
            tags {
              title
            }
            image {
              alt
              localImage {
                ...ImageSharpFixed
              }
            }
          }
          childrenImagesFromHtml {
            urlOriginal
            localImage {
              ...ImageSharpFixed
            }
          }
        }
      }
    }
    fragment ImageSharpFixed on File {
      childImageSharp {
        fixed(width: 200, height: 150) {
          width
          height
          base64
          aspectRatio
          src
          srcSet
          srcWebp
          srcSetWebp
        }
      }
    }
  `);
  if (!data) {
    console.error('errors', errors);
    throw new Error('Cannot fetch articles from Gatsby.');
  }
  data.allDrupalArticle.nodes.forEach((article) =>
    article.translations.forEach((translation) => {
      const context: ArticleContext = {
        article: translation,
        childrenImagesFromHtml: article.childrenImagesFromHtml,
        otherLanguages: article.translations
          .filter((it) => it.langcode !== translation.langcode)
          .map((other) => ({
            path: other.path,
            language: languages.find((it) => it.id === other.langcode)!,
          })),
      };

      const path = translation.path;
      const component = require.resolve(`./src/components/article`);

      // TODO: remove once the stale page data issue is fixed.
      //  https://github.com/gatsbyjs/gatsby/issues/26520
      // Temporary fix: Call createPage twice with different contexts. This
      // helps Gatsby to refresh the page data.
      actions.createPage({ path, component, context: 'fake context' });

      return actions.createPage({ path, component, context });
    }),
  );
};
