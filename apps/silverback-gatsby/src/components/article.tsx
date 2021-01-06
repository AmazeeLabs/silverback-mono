import { PageProps } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';

const Article: React.FC<PageProps> = ({ pageContext }) => {
  const { article } = pageContext as {
    article: AllArticlesQuery['allDrupalNodeArticle']['nodes'][number];
  };

  const imageSets: ImageSet[] = [];
  for (const childImage of article.childrenImagesFromHtml || []) {
    if (childImage?.localImage?.childImageSharp?.fixed) {
      imageSets.push({
        url: childImage.url,
        props: {
          fixed: childImage.localImage.childImageSharp.fixed,
        },
      });
    }
  }

  return (
    <>
      Title: <a href={`/articles/${article.entityId}`}>{article.entityLabel}</a>
      <br />
      Body:{' '}
      <div className="html-from-drupal">
        {article.body?.processed &&
          renderHtml(article.body.processed, imageSets)}
      </div>
      <br />
      Tags:{' '}
      {article.fieldTags?.map((tag) => tag?.entity?.entityLabel).join(', ')}
      <br />
      Image:{' '}
      {article.fieldImage?.entity?.localImage?.childImageSharp?.fixed && (
        <Image
          alt={article.fieldImage?.entity?.fieldMediaImage?.alt}
          fixed={article.fieldImage.entity.localImage.childImageSharp.fixed}
        />
      )}
    </>
  );
};

export default Article;
