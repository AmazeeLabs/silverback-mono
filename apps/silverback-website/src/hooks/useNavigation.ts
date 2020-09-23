import { graphql, useStaticQuery } from 'gatsby';

export type NavigationNode = {
  title: string;
  path: string;
  children?: NavigationNode[];
};

export const useNavigation = () => {
  const {
    allMdx: { edges },
  } = useStaticQuery<{
    allMdx: {
      edges: {
        node: {
          frontmatter: {
            path: string;
            title: string;
          };
        };
      }[];
    };
  }>(graphql`
    query NavigationQuery {
      allMdx(sort: { fields: frontmatter___path, order: ASC }) {
        edges {
          node {
            frontmatter {
              path
              title
            }
          }
        }
      }
    }
  `);

  return {
    nodes: edges.reduce((navigation, { node }) => {
      const firstSegment = node.frontmatter.path.substr(1).split('/').shift();

      if (
        firstSegment &&
        navigation.find((rootNode) => rootNode.path === `/${firstSegment}`)
      ) {
        navigation = navigation.map((rootNode) =>
          rootNode.path !== `/${firstSegment}`
            ? rootNode
            : {
                ...rootNode,
                children: [
                  {
                    path: node.frontmatter.path,
                    title: node.frontmatter.title,
                  },
                  ...(rootNode.children || []),
                ],
              },
        );
      } else {
        navigation.push({
          path: node.frontmatter.path,
          title: node.frontmatter.title,
        });
      }

      return navigation;
    }, [] as NavigationNode[]),
  };
};
