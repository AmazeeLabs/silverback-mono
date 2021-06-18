import { CreatePagesArgs } from '../../../gatsby-node';
import { languages } from '../../constants/languages';
import { ArticleContext } from '../../types/page-context';

export const createArticlePages = async ({
  graphql,
  actions,
}: CreatePagesArgs): Promise<void> => {
  // Create article pages. Notice that we fetch from Gatsby GraphQL, not from
  // Drupal.
  const { data, errors } = await graphql<AllArticlesQuery>(`
    query AllArticles {
      allDrupalArticle {
        nodes {
          remoteId
          langcode
          path
          translations {
            path
            langcode
          }
        }
      }
    }
  `);
  if (!data) {
    console.error('errors', errors);
    throw new Error('Cannot fetch articles from Gatsby.');
  }
  data.allDrupalArticle.nodes.forEach((article) => {
    const context: ArticleContext = {
      remoteId: article.remoteId,
      langcode: article.langcode,
      otherLanguages: article.translations.map((other) => ({
        path: other.path,
        language:
          languages.find((lang) => lang.id === other.langcode) || languages[0],
      })),
    };

    const path = article.path;
    const component = require.resolve(`../../components/article`);

    return actions.createPage({ path, component, context });
  });
};
