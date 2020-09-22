import { SEO } from '@amazeelabs/gatsby-theme-core';
import { PageProps } from 'gatsby';
import React from 'react';

const NotFoundPage: React.FC<PageProps> = () => (
  <div className="bg-white rounded-lg shadow-xl px-5 py-6 sm:px-6">
    <SEO title="404: Not found" />
    <h1>NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
  </div>
);

export default NotFoundPage;
