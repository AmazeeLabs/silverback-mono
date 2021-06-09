import { CreatePagesArgs } from '../../../gatsby-node';
import { languages } from '../../constants/languages';
import { GutenbergPageContext } from '../../types/page-context';

export const createGutenbergPages = async ({
  graphql,
  actions,
}: CreatePagesArgs): Promise<void> => {
  const { data, errors } = await graphql<AllGutenbergPagesQuery>(`
    query AllGutenbergPages {
      allDrupalGutenbergPageTranslations {
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
  // TODO (gutenberg): find a way to move the above Block* fragments closer to
  //  their components components.
  if (!data) {
    console.error('errors', errors);
    throw new Error('Cannot fetch Gutenberg pages from Gatsby.');
  }
  data.allDrupalGutenbergPageTranslations.nodes.forEach((page) =>
    page.translations.forEach((translation) => {
      const context: GutenbergPageContext = {
        remoteId: page.remoteId,
        langcode: translation.langcode,
        otherLanguages: page.translations
          .filter((it) => it.langcode !== translation.langcode)
          .map((other) => ({
            path: other.path,
            language: languages.find((it) => it.id === other.langcode)!,
          })),
      };

      const path = translation.path;
      const component = require.resolve(`../../components/gutenberg-page`);

      // TODO: remove once the stale page data issue is fixed.
      //  https://github.com/gatsbyjs/gatsby/issues/26520
      // Temporary fix: Call createPage twice with different contexts. This
      // helps Gatsby to refresh the page data.
      actions.createPage({ path, component, context: 'fake context' });

      return actions.createPage({ path, component, context });
    }),
  );
};
