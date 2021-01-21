import { graphql, Link, PageProps, useStaticQuery } from 'gatsby';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';

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
          <td className="border-solid border-4">ID</td>
          <td className="border-solid border-4">Title</td>
          <td className="border-solid border-4">Language</td>
          <td className="border-solid border-4">Path</td>
          <td className="border-solid border-4">Body</td>
        </tr>
        {somePage?.translations.map((page) => (
          <tr key={`page-row-${somePage.id}-${page.langcode}`}>
            <td className="border-solid border-4">{somePage.id}</td>
            <td className="border-solid border-4">{page.title}</td>
            <td className="border-solid border-4">{page.langcode}</td>
            <td className="border-solid border-4">{page.path}</td>
            <td className="border-solid border-4">
              <div className="html-from-drupal">
                {page.body && renderHtml(page.body, imageSets)}
              </div>
            </td>
          </tr>
        ))}
      </table>
      <b>All articles. Linked to dedicated site pages.</b>
      <table>
        <tr>
          <td className="border-solid border-4">ID</td>
          <td className="border-solid border-4">Title/Link</td>
          <td className="border-solid border-4">Language</td>
          <td className="border-solid border-4">Path</td>
          <td className="border-solid border-4">Tags</td>
        </tr>
        {articles.map((article) =>
          article.translations.map((translation) => (
            <tr key={`article-row-${article.id}-${translation.langcode}`}>
              <td className="border-solid border-4">{article.id}</td>
              <td className="border-solid border-4">
                <Link to={translation.path}>{translation.title}</Link>
              </td>
              <td className="border-solid border-4">{translation.langcode}</td>
              <td className="border-solid border-4">{translation.path}</td>
              <td className="border-solid border-4">
                {translation.tags.map((tag) => tag.title).join(', ')}
              </td>
            </tr>
          )),
        )}
      </table>
    </>
  );
};

export default IndexPage;
