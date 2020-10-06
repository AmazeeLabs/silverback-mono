import { SEO } from '@amazeelabs/gatsby-theme-core';
import { graphql, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql`
  query HomePage {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

const IndexPage: React.FC<PageProps & HomePageQuery> = ({ site }) => (
  <>
    <SEO title={site?.siteMetadata?.title || 'No title'} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
  </>
);

export default IndexPage;
