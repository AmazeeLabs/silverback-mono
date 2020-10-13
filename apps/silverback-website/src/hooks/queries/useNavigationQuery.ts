import { graphql, useStaticQuery } from 'gatsby';

export const useNavigationQuery = () =>
  useStaticQuery<NavigationQuery>(graphql`
    query Navigation {
      allMdx(sort: { fields: frontmatter___position, order: ASC }) {
        group(field: frontmatter___nav) {
          nodes {
            fileAbsolutePath
            frontmatter {
              path
              title
              nav
            }
          }
        }
        distinct(field: frontmatter___nav)
      }
    }
  `);
