import { graphql, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql`
  query SiteName {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

const IndexPage: React.FC<PageProps & SiteNameQuery> = ({ site }) => (
  <>
    <h1>{site?.siteMetadata?.title}</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
  </>
);

export default IndexPage;
