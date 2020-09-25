import { graphql, useStaticQuery } from 'gatsby';

import { trim } from '../utils';

export type NavigationNode = {
  title: string;
  path: string;
  children?: NavigationNode[];
};

export const useNavigation = () => {
  const {
    allMdx: { distinct: navigation, group: navigationGroups },
  } = useStaticQuery<{
    allMdx: {
      group: {
        edges: {
          node: {
            frontmatter: {
              path: string;
              title: string;
              nav: string;
            };
          };
        }[];
      }[];
      distinct: string[];
    };
  }>(graphql`
    query NavigationQuery {
      allMdx(sort: { fields: frontmatter___position, order: ASC }) {
        group(field: frontmatter___nav) {
          edges {
            node {
              frontmatter {
                path
                title
                nav
              }
            }
          }
        }
        distinct(field: frontmatter___nav)
      }
    }
  `);

  return {
    nodes: navigation.map((title, navIndex) => ({
      title,
      path: `/${trim(
        navigationGroups[navIndex].edges[0].node.frontmatter.path,
        '/',
      )
        .split('/')
        .shift()}`,
      children:
        navigationGroups[navIndex].edges.length > 1
          ? navigationGroups[navIndex].edges.reduce((children, { node }) => {
              children.push({
                title: node.frontmatter.title,
                path: node.frontmatter.path,
              });

              return children;
            }, [] as NavigationNode[])
          : undefined,
    })),
  };
};
