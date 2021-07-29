import { SilverbackPageContext } from '@amazeelabs/gatsby-source-silverback';
import { graphql, Link, PageProps } from 'gatsby';
import React from 'react';

import { BlockHtml } from '../components/content-blocks/html';
import { BlockImage } from '../components/content-blocks/image';
import { BlockTeaser } from '../components/content-blocks/teaser';
import { BlockTwoColumns } from '../components/content-blocks/two-columns';
import { otherLanguages } from '../util/other-languages';
import { Row } from '../util/Row';
import { UnreachableCaseError } from '../util/types';

export const query = graphql`
  query GutenbergPage($remoteId: String!) {
    drupalGutenbergPage(remoteId: { eq: $remoteId }) {
      id
      title
      body {
        __typename
        ...BlockTwoColumns
        ...BlockHtml
        ...BlockImage
        ...BlockTeaser
      }
      translations {
        langcode
        path
      }
    }
  }
  fragment BlockHtml on DrupalBlockHtml {
    html
  }
  fragment BlockImage on DrupalBlockImage {
    caption
    image {
      localImage {
        ...ImageSharpFixed
      }
    }
  }
  fragment BlockTeaser on DrupalBlockTeaser {
    image {
      localImage {
        ...ImageSharpFixed
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
  PageProps<GutenbergPageQuery, SilverbackPageContext>
> = ({ pageContext: { locale }, data }) => {
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
              {otherLanguages(locale!, page.translations).map((other) => (
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
