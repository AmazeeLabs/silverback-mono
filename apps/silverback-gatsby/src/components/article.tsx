import { Link, PageProps } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';
import { ArticleContext } from '../types/page-context';

const Article: React.FC<PageProps> = ({ pageContext }) => {
  const {
    article,
    childrenImagesFromHtml,
    otherLanguages,
  } = pageContext as ArticleContext;

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
          <td className="border-solid border-4">Title</td>
          <td className="border-solid border-4">Tags</td>
          <td className="border-solid border-4">Body</td>
          <td className="border-solid border-4">Image</td>
          <td className="border-solid border-4">Other languages</td>
        </tr>
        <tr>
          <td className="border-solid border-4">{article.title}</td>
          <td className="border-solid border-4">
            {article.tags.map((tag) => tag.title).join(', ')}
          </td>
          <td className="border-solid border-4">
            <div className="html-from-drupal">
              {article.body && renderHtml(article.body, imageSets)}
            </div>
          </td>
          <td className="border-solid border-4">
            {article.image?.localImage?.childImageSharp?.fixed && (
              <Image
                alt={article.image.alt}
                fixed={article.image.localImage.childImageSharp.fixed}
              />
            )}
          </td>
          <td className="border-solid border-4">
            <ul>
              {otherLanguages.map((other) => (
                <li key={`language-link-${other.language.id}`}>
                  <Link to={other.path}>{other.language.name}</Link>
                </li>
              ))}
            </ul>
          </td>
        </tr>
      </table>
    </>
  );
};

export default Article;
