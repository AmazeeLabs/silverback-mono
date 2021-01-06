import { graphql } from 'gatsby';

export const ImageSharpFixed = graphql`
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
`;
