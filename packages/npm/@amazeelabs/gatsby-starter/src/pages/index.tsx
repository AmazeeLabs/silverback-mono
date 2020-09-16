import { SEO } from '@amazeelabs/gatsby-theme-core';
import { PageProps } from 'gatsby';
import React from 'react';

const IndexPage: React.FC<PageProps> = () => (
  <>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
  </>
);

export default IndexPage;
