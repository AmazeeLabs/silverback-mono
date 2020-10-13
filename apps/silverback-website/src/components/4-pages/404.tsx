import { useFrameworkDependencies } from '@dependencies';
import React from 'react';

import Page from '../3-layouts/Page';

const NotFound: React.FC = () => {
  const { SEO } = useFrameworkDependencies();
  return (
    <Page>
      <div className="items-start md:flex">
        <SEO title="The page was not found 🙈" />
        <article className="w-full p-6 bg-white rounded-lg shadow-xl lg:p-8 xl:p-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none sm:max-w-none">
          <h1>The page was not found 🦍</h1>
        </article>
      </div>
    </Page>
  );
};

export default NotFound;
