import { SilverbackPageContext } from '@amazeelabs/gatsby-source-silverback';
import { graphql, Link, PageProps } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';
import { useIntl } from 'react-intl';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';
import { languages } from '../constants/languages';
import { StandardLayout } from '../layouts/StandardLayout';
import { LocationState } from '../types/LocationState';
import { Row } from '../util/Row';

export const query = graphql`
  query Article($remoteId: String!) {
    drupalArticle(remoteId: { eq: $remoteId }) {
      id
      langcode
      path
      title
      body
      tags {
        title
      }
      image {
        alt
        localImage {
          ...ImageSharpFixed
        }
      }
      childrenImagesFromHtml {
        urlOriginal
        localImage {
          ...ImageSharpFixed
        }
      }
    }
  }
`;

const Article: React.FC<
  PageProps<ArticleQuery, SilverbackPageContext, LocationState>
> = ({ pageContext: { locale, localizations }, data, location }) => {
  const childrenImagesFromHtml = data.drupalArticle?.childrenImagesFromHtml;
  const article = data.drupalArticle!;

  const imageSets: ImageSet[] = [];
  for (const childImage of childrenImagesFromHtml || []) {
    if (childImage?.localImage?.childImageSharp?.fixed) {
      imageSets.push({
        url: childImage.urlOriginal,
        props: {
          fixed: childImage.localImage.childImageSharp.fixed,
        },
      });
    }
  }
  const intl = useIntl();

  return (
    <StandardLayout locationState={location.state}>
      <Link to="/">To frontpage</Link>
      <table>
        <tr>
          <Row>
            {
              intl.formatMessage({
                defaultMessage: 'Title',
              })
            }
          </Row>
          <Row>
            {
              intl.formatMessage({
                defaultMessage: 'Tags',
              })
            }
          </Row>
          <Row>
            {
              intl.formatMessage({
                defaultMessage: 'Body',
              })
            }
          </Row>
          <Row>
            {
              intl.formatMessage({
                defaultMessage: 'Image',
              })
            }
          </Row>
          <Row>
            {
              intl.formatMessage({
                defaultMessage: 'Other languages',
              })
            }
          </Row>
        </tr>
        <tr>
          <Row>{article.title}</Row>
          <Row>{article.tags?.map((tag) => tag.title).join(', ')}</Row>
          <Row>
            <div className="html-from-drupal">
              {article.body && renderHtml(article.body, imageSets)}
            </div>
          </Row>
          <td className="border-solid border-4">
            {article.image?.localImage?.childImageSharp?.fixed && (
              <Image
                alt={article.image.alt}
                fixed={article.image.localImage.childImageSharp.fixed}
              />
            )}
          </td>
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

export default Article;
