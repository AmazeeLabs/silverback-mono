import { GatsbyNode } from 'gatsby';

import { languages } from '../../constants/languages';
import { GutenbergPageContext } from '../../types/page-context';

export const createGutenbergPages: Required<GatsbyNode>['createPages'] = async ({
  graphql,
  actions,
}) => {
  const { data, errors } = await graphql<AllGutenbergPagesQuery>(`
    query AllGutenbergPages {
      allDrupalGutenbergPage {
        nodes {
          id
          translations {
            langcode
            path
            title
            body {
              __typename
              ...BlockHtml
              ...BlockImage
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
    fragment BlockHtml on DrupalBlockHtml {
      html
    }
    fragment BlockImage on DrupalBlockImage {
      caption
      image {
        localImage {
          ...ImageSharpFixed
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
  data.allDrupalGutenbergPage.nodes.forEach((page) =>
    page.translations.forEach((translation) => {
      const context: GutenbergPageContext = {
        page: translation,
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
