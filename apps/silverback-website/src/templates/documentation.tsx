import { SEO } from '@amazeelabs/gatsby-theme-core';
import { MDXProvider } from '@mdx-js/react';
import { graphql, PageProps } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';

import { Code, TOC } from '../components';
import { preToCodeBlock, slugify } from '../utils';

export const pageQuery = graphql`
  query DocQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
      headings(depth: h2) {
        value
      }
    }
  }
`;

const H2: React.FC<React.DetailedHTMLProps<
  React.HTMLAttributes<HTMLHeadingElement>,
  HTMLHeadingElement
>> = ({ id, children, ...props }) => (
  <h2 id={typeof children === 'string' ? slugify(children) : id} {...props}>
    {children}
  </h2>
);

const Documentation: React.FC<PageProps<{
  mdx: {
    body: string;
    frontmatter: {
      title: string;
    };
    headings: {
      value: string;
    }[];
  };
}>> = ({ data: { mdx } }) => (
  <>
    <SEO title={mdx.frontmatter.title} />
    <MDXProvider
      components={{
        h2: H2,
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
      <div className="md:flex items-start">
        {mdx.headings.length > 1 && (
          <TOC items={mdx.headings.map((heading) => heading.value)} />
        )}
        <div className="bg-white rounded-lg shadow-xl px-5 py-6 sm:px-6">
          <MDXRenderer>{mdx.body}</MDXRenderer>
        </div>
      </div>
    </MDXProvider>
  </>
);

export default Documentation;
