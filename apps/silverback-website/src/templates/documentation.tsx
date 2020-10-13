import Code from '@atoms/Code';
import { MDXProvider } from '@mdx-js/react';
import Documentation from '@pages/Documentation';
import { graphql, PageProps } from 'gatsby';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import _ from 'lodash';
import React from 'react';

import { DataDependencyWrapper } from '../gatsby-api';

export const pageQuery = graphql`
  query Documentation($id: String) {
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

const DocumentationPage: React.FC<PageProps<DocumentationQuery>> = ({
  data: { mdx },
}) =>
  mdx ? (
    <DataDependencyWrapper>
      <Documentation
        title={_.defaultTo(mdx.frontmatter?.title, 'Unknown title') || ''}
        toc={
          mdx.tableOfContents.items[0].items as {
            url: string;
            title: string;
          }[]
        }
      >
        <MDXProvider
          components={{
            pre: Code,
          }}
        >
          <MDXRenderer>{mdx.body}</MDXRenderer>
        </MDXProvider>
      </Documentation>
    </DataDependencyWrapper>
  ) : null;

export default DocumentationPage;
