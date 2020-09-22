import { SEO } from '@amazeelabs/gatsby-theme-core';
import { MDXProvider } from '@mdx-js/react';
import { graphql, PageProps } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';

import { Code, TOC } from '../components';

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

const preToCodeBlock = (preProps: any) => {
  if (
    // children is code element
    preProps.children &&
    // code props
    preProps.children.props &&
    // if children is actually a <code>
    preProps.children.props.mdxType === 'code'
  ) {
    // we have a <pre><code> situation
    const {
      children: codeString,
      className = '',
      ...props
    } = preProps.children.props;

    const match = className.match(/language-([\0-\uFFFF]*)/);

    return {
      codeString: codeString.trim(),
      className,
      language: match != null ? match[1] : '',
      ...props,
    };
  }
  return undefined;
};

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
      <div className="flex items-start">
        {!!mdx.headings.length && (
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
