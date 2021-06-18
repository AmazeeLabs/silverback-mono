import { graphql, Link, PageProps } from 'gatsby';
import React from 'react';

import { GutenbergPageContext } from '../types/page-context';
import { Row } from '../util/Row';
import { UnreachableCaseError } from '../util/types';
import { BlockHtml } from './content-blocks/html';
import { BlockImage } from './content-blocks/image';
import { BlockTeaser } from './content-blocks/teaser';
import { BlockTwoColumns } from './content-blocks/two-columns';

export const query = graphql`
  query GutenbergPage($remoteId: String!, $langcode: String!) {
    drupalGutenbergPage(
      remoteId: { eq: $remoteId }
      langcode: { eq: $langcode }
    ) {
      id
      title
      body {
        __typename
        ...BlockTwoColumns
        ...BlockHtml
        ...BlockImage
        ...BlockTeaser
      }
    }
  }
  fragment BlockHtml on DrupalBlockHtml {
    html
  }
  fragment BlockImage on DrupalBlockImage {
    caption
    image {
      translation(langcode: $langcode) {
        localImage {
          ...ImageSharpFixed
        }
      }
    }
  }
  fragment BlockTeaser on DrupalBlockTeaser {
    image {
      translation(langcode: $langcode) {
        localImage {
          ...ImageSharpFixed
        }
      }
    }
    title
    subtitle
    url
  }
  fragment BlockTwoColumns on DrupalBlockTwoColumns {
    children {
      __typename
      children {
        __typename
        ...BlockHtml
        ...BlockImage
        ...BlockTeaser
      }
    }
  }
`;

const GutenbergPage: React.FC<
  PageProps<GutenbergPageQuery, GutenbergPageContext>
> = ({ pageContext, data }) => {
  const { otherLanguages } = pageContext as GutenbergPageContext;

  const page = data.drupalGutenbergPage!;

  return (
    <>
      <Link to="/">To frontpage</Link>
      <table>
        <tr>
          <Row>Title</Row>
          <Row>Body</Row>
          <Row>Other languages</Row>
        </tr>
        <tr>
          <Row>{page.title}</Row>
          <Row>
            {page.body.map((block) => {
              switch (block.__typename) {
                case 'DrupalBlockHtml':
                  return <BlockHtml {...block} />;
                case 'DrupalBlockImage':
                  return <BlockImage {...block} />;
                case 'DrupalBlockTwoColumns':
                  return <BlockTwoColumns {...block} />;
                case 'DrupalBlockTeaser':
                  return <BlockTeaser {...block} />;
                default:
                  throw new UnreachableCaseError(block);
              }
            })}
          </Row>
          <Row>
            <ul>
              {otherLanguages.map((other) => (
                <li key={`language-link-${other.language.id}`}>
                  <Link to={other.path}>{other.language.name}</Link>
                </li>
              ))}
            </ul>
          </Row>
        </tr>
      </table>
    </>
  );
};

export default GutenbergPage;
