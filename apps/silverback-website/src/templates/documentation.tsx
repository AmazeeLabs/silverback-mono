import { SEO } from '@amazeelabs/gatsby-theme-core';
import { MDXProvider } from '@mdx-js/react';
import { graphql, PageProps } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import React from 'react';

import { Code } from '../components/code';

export const pageQuery = graphql`
  query DocQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
      frontmatter {
        title
      }
    }
  }
`;

const tagWithClassName = (
  Tag: string,
  className: string,
): React.FC<{
  Tag: JSX.Element;
  className: string;
  // eslint-disable-next-line react/display-name
}> => ({ children, ...props }) => (
  // @ts-ignore
  <Tag {...props} className={className}>
    {children}
  </Tag>
);

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
  };
}>> = ({ data: { mdx } }) => (
  <>
    <SEO title={mdx.frontmatter.title} />
    <MDXProvider
      components={{
        h1: tagWithClassName(
          'h1',
          'mb-4 -ml-1 text-3xl font-extrabold tracking-wider',
        ),
        h2: tagWithClassName(
          'h2',
          'mb-4 -ml-1 text-xl font-bold tracking-wide',
        ),
        h3: tagWithClassName('h3', 'mb-4 -ml-1 text-lg font-bold'),
        h4: tagWithClassName('h4', 'mb-4 -ml-1 text-lg font-semibold'),
        h5: tagWithClassName('h5', 'mb-4 -ml-1 text-lg font-medium'),
        h6: tagWithClassName('h6', 'mb-4 -ml-1 text-base font-semibold'),
        p: tagWithClassName('p', 'leading-relaxed font-light mt-2 mb-4'),
        a: tagWithClassName(
          'a',
          'text-amazee-yellowDark leading-relaxed font-medium mb-8',
        ),
        blockquote: tagWithClassName(
          'blockquote',
          'border-solid border-l-4 border-gray-300 pl-4',
        ),
        ul: tagWithClassName('ul', 'list-disc m-4'),
        ol: tagWithClassName('ol', 'list-decimal m-4'),
        li: tagWithClassName('li', 'font-light my-1'),
        strong: tagWithClassName('strong', 'font-semibold'),
        em: tagWithClassName('em', 'italic'),
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
      <MDXRenderer>{mdx.body}</MDXRenderer>
    </MDXProvider>
  </>
);

export default Documentation;
