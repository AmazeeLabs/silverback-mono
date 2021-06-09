import { graphql, Link, PageProps } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';
import { ArticleContext } from '../types/page-context';
import { Row } from '../util/Row';

export const query = graphql`
  query Article($remoteId: String!, $langcode: String!) {
    drupalArticleTranslations(remoteId: { eq: $remoteId }) {
      id
      translation(langcode: $langcode) {
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

const Article: React.FC<PageProps<ArticleQuery, ArticleContext>> = ({
  pageContext,
  data,
}) => {
  const { otherLanguages } = pageContext;
  const childrenImagesFromHtml =
    data.drupalArticleTranslations?.childrenImagesFromHtml;
  const article = data.drupalArticleTranslations?.translation!;

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

  return (
    <>
      <Link to="/">To frontpage</Link>
      <table>
        <tr>
          <Row>Title</Row>
          <Row>Tags</Row>
          <Row>Body</Row>
          <Row>Image</Row>
          <Row>Other languages</Row>
        </tr>
        <tr>
          <Row>{article.title}</Row>
          <Row>{article.tags.map((tag) => tag.title).join(', ')}</Row>
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

export default Article;
