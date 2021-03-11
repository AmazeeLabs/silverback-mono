import { graphql, Link, PageProps, useStaticQuery } from 'gatsby';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';
import { Row } from '../util/Row';

const IndexPage: React.FC<PageProps> = () => {
  const {
    drupalPage: somePage,
    allDrupalArticle: { nodes: articles },
  } = useStaticQuery<IndexPageQuery>(graphql`
    query IndexPage {
      drupalPage {
        id
        translations {
          langcode
          path
          title
          body
        }
        childrenImagesFromHtml {
          urlOriginal
          localImage {
            ...ImageSharpFixed
          }
        }
      }
      allDrupalArticle {
        nodes {
          id
          translations {
            langcode
            path
            title
            tags {
              title
            }
          }
        }
      }
    }
  `);

  const imageSets: ImageSet[] = [];
  for (const childImage of somePage?.childrenImagesFromHtml || []) {
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
      <b>Some page. Just one Page node. Without a dedicated site page.</b>
      <table>
        <tr>
          <Row>ID</Row>
          <Row>Title</Row>
          <Row>Language</Row>
          <Row>Path</Row>
          <Row>Body</Row>
        </tr>
        {somePage?.translations.map((page) => (
          <tr key={`page-row-${somePage.id}-${page.langcode}`}>
            <Row>{somePage.id}</Row>
            <Row>{page.title}</Row>
            <Row>{page.langcode}</Row>
            <Row>{page.path}</Row>
            <Row>
              <div className="html-from-drupal">
                {page.body && renderHtml(page.body, imageSets)}
              </div>
            </Row>
          </tr>
        ))}
      </table>
      <b>All articles. Linked to dedicated site pages.</b>
      <table>
        <tr>
          <Row>ID</Row>
          <Row>Title/Link</Row>
          <Row>Language</Row>
          <Row>Path</Row>
          <Row>Tags</Row>
        </tr>
        {articles.map((article) =>
          article.translations.map((translation) => (
            <tr key={`article-row-${article.id}-${translation.langcode}`}>
              <Row>{article.id}</Row>
              <Row>
                <Link to={translation.path}>{translation.title}</Link>
              </Row>
              <Row>{translation.langcode}</Row>
              <Row>{translation.path}</Row>
              <Row>{translation.tags.map((tag) => tag.title).join(', ')}</Row>
            </tr>
          )),
        )}
      </table>
    </>
  );
};

export default IndexPage;
