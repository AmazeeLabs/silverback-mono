import { SEO } from '@amazeelabs/gatsby-theme-core';
import { MDXProvider } from '@mdx-js/react';
import { graphql, PageProps } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';

import { Code, TOC, TOCItem } from '../components';
import { preToCodeBlock } from '../utils';

export const pageQuery = graphql`
  query DocQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
      tableOfContents(maxDepth: 2)
    }
  }
`;

const Documentation: React.FC<PageProps<{
  mdx: {
    body: string;
    frontmatter: {
      title: string;
    };
    tableOfContents: {
      items: TOCItem[];
    };
  };
}>> = ({ data: { mdx } }) => (
  <>
    <SEO title={mdx.frontmatter.title} />
    <MDXProvider
      components={{
        pre: (preProps) => {
          const props = preToCodeBlock(preProps);
          // if there's a codeString and some props, we passed the test
          if (props) {
            return <Code {...props} />;
          } else {
            // it's possible to have a pre without a code in it
            return <pre {...preProps} />;
          }
        },
      }}
    >
      <div className="items-start md:flex">
        {mdx.tableOfContents.items[0].items!.length > 1 && (
          <TOC items={mdx.tableOfContents.items[0].items!} />
        )}
        <article className="min-w-0 p-6 bg-white rounded-lg shadow-xl lg:p-8 xl:p-10 prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none sm:max-w-none">
          <MDXRenderer>{mdx.body}</MDXRenderer>
        </article>
      </div>
    </MDXProvider>
  </>
);

export default Documentation;
