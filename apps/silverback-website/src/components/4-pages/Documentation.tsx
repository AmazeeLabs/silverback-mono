import { useFrameworkDependencies } from '@dependencies';
import React from 'react';

import Page from '../3-layouts/Page';

const Documentation: React.FC<{
  title: string;
  toc: {
    url: string;
    title: string;
  }[];
}> = ({ title, children, toc }) => {
  const { SEO } = useFrameworkDependencies();
  return (
    <Page>
      <div className="items-start lg:grid grid-cols-4">
        <SEO title={title} />
        {toc.length > 1 ? (
          <aside className="py-6 mb-8 min-w-full sm:min-w-0 bg-white rounded-lg shadow-xl px-4 sm:px-6 md:mr-4 md:sticky md:top-4 prose prose-sm sm:prose max-w-none sm:max-w-none md:max-w-none">
            <h3 className="mt-0 font-bold">Table of contents</h3>
            <ul className="mb-0 list-none">
              {toc.map(({ title, url }, index) => (
                <li className="mb-1" key={index}>
                  <a href={url}>{title}</a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        <article className="col-span-3 p-6 w-full bg-white rounded-lg shadow-xl lg:p-8 xl:p-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none sm:max-w-none md:max-w-none">
          {children}
        </article>
      </div>
    </Page>
  );
};

export default Documentation;
