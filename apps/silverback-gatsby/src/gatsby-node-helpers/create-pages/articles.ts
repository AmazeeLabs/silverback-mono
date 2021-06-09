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
      allDrupalArticleTranslations {
        nodes {
          remoteId
          translations {
            langcode
            path
          }
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
        remoteId: article.remoteId,
        langcode: translation.langcode,
        otherLanguages: article.translations
          .filter((it) => it.langcode !== translation.langcode)
          .map((other) => ({
            path: other.path,
            language: languages.find((it) => it.id === other.langcode)!,
          })),
      };

      const path = translation.path;
      const component = require.resolve(`../../components/article`);

      return actions.createPage({ path, component, context });
    }),
  );
};
