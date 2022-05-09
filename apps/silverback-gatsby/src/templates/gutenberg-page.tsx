import { SilverbackPageContext } from '@amazeelabs/gatsby-source-silverback';
import { graphql, Link, PageProps } from 'gatsby';
import React from 'react';

import { BlockHtml } from '../components/content-blocks/html';
import { BlockImage } from '../components/content-blocks/image';
import { BlockTeaser } from '../components/content-blocks/teaser';
import { BlockTwoColumns } from '../components/content-blocks/two-columns';
import { languages } from '../constants/languages';
import { StandardLayout } from '../layouts/StandardLayout';
import { LocationState } from '../types/LocationState';
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
        ...BlockHtmlParagraph
        ...BlockHtmlList
        ...BlockHtmlQuote
        ...BlockImage
        ...BlockTeaser
      }
    }
  }
  fragment BlockHtmlParagraph on DrupalBlockHtmlParagraph {
    html
  }
  fragment BlockHtmlList on DrupalBlockHtmlList {
    html
  }
  fragment BlockHtmlQuote on DrupalBlockHtmlQuote {
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
        ...BlockHtmlParagraph
        ...BlockHtmlList
        ...BlockHtmlQuote
        ...BlockImage
        ...BlockTeaser
      }
    }
  }
`;

const GutenbergPage: React.FC<
  PageProps<GutenbergPageQuery, SilverbackPageContext, LocationState>
> = ({ pageContext: { locale, localizations }, data, location }) => {
  const page = data.drupalGutenbergPage!;

  return (
    <StandardLayout locationState={location.state}>
      <Link to="/">To frontpage</Link>
      <table>
        <tr>
          <Row>Title</Row>
          <Row>Body</Row>
          <Row>Other languages</Row>
        </tr>
        <tr>
          <Row>{page.title}</Row>
          <Row className="gutenberg-body">
            {page.body.map((block) => {
              switch (block.__typename) {
                case 'DrupalBlockHtmlParagraph':
                case 'DrupalBlockHtmlList':
                case 'DrupalBlockHtmlQuote':
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
              {localizations
                ?.filter((it) => it.locale !== locale)
                .map((other) => (
                  <li key={`language-link-${other.locale}`}>
                    <Link to={other.path}>
                      {languages.find((it) => it.id === other.locale)!.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </Row>
        </tr>
      </table>
    </StandardLayout>
  );
};

export default GutenbergPage;
