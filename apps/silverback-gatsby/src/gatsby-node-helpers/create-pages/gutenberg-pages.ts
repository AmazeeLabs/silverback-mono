import { CreatePagesArgs } from '../../../gatsby-node';
import { languages } from '../../constants/languages';
import { GutenbergPageContext } from '../../types/page-context';

export const createGutenbergPages = async ({
  graphql,
  actions,
}: CreatePagesArgs): Promise<void> => {
  const { data, errors } = await graphql<AllGutenbergPagesQuery>(`
    query AllGutenbergPages {
      allDrupalGutenbergPage {
        nodes {
          remoteId
          langcode
          path
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

  data.allDrupalGutenbergPage.nodes.forEach((page) => {
    const context: GutenbergPageContext = {
      remoteId: page.remoteId,
      langcode: page.langcode,
      otherLanguages: page.translations.map((other) => ({
        path: other.path,
        language:
          languages.find((lang) => lang.id === other.langcode) || languages[0],
      })),
    };

    const path = page.path;
    const component = require.resolve(`../../components/gutenberg-page`);

    actions.createPage({ path, component, context });
  });
};
