import { PageProps } from 'gatsby';
import Image from 'gatsby-image';
import React from 'react';

const Article: React.FC<PageProps> = ({ pageContext }) => {
  const { article } = pageContext as {
    article: AllArticlesQuery['allDrupalNodeArticle']['nodes'][number];
  };
  return (
    <>
      Title: <a href={`/articles/${article.entityId}`}>{article.entityLabel}</a>
      <br />
      Body:{' '}
      {article.body?.processed && (
        <div dangerouslySetInnerHTML={{ __html: article.body.processed }} />
      )}
      <br />
      Tags:{' '}
      {article.fieldTags?.map((tag) => tag?.entity?.entityLabel).join(', ')}
      <br />
      Image:{' '}
      {article.fieldImage?.entity?.localImage?.childImageSharp?.fluid && (
        <Image
          alt={article.fieldImage?.entity?.fieldMediaImage?.alt}
          fluid={article.fieldImage.entity.localImage.childImageSharp.fluid}
        />
      )}
    </>
  );
};

export default Article;
