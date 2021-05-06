import { GatsbyNode } from 'gatsby';

import { languages } from '../../constants/languages';
import { ArticleContext } from '../../types/page-context';

export const createArticlePages: Required<GatsbyNode>['createPages'] = async ({
  graphql,
  actions,
}) => {
  // Create article pages. Notice that we fetch from Gatsby GraphQL, not from
  // Drupal.
  const { data, errors } = await graphql<AllArticlesQuery>(`
    query AllArticles {
      allDrupalArticleTranslations {
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
  data.allDrupalArticleTranslations.nodes.forEach((article) =>
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
      const component = require.resolve(`../../components/article`);

      // TODO: remove once the stale page data issue is fixed.
      //  https://github.com/gatsbyjs/gatsby/issues/26520
      // Temporary fix: Call createPage twice with different contexts. This
      // helps Gatsby to refresh the page data.
      actions.createPage({ path, component, context: 'fake context' });

      return actions.createPage({ path, component, context });
    }),
  );
};
