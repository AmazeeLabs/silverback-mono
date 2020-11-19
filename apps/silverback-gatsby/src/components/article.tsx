import { PageProps } from 'gatsby';
import React from 'react';

const Article: React.FC<PageProps> = ({ pageContext }) => {
  const { article } = pageContext as {
    article: AllArticlesQuery['allDrupalNodeArticle']['nodes'][number];
  };
  return (
    <>
      Title: <a href={`/articles/${article.entityId}`}>{article.entityLabel}</a>
      <br />
      Body: {article.body?.processed}
      <br />
      Tags:{' '}
      {article.fieldTags?.map((tag) => tag?.entity?.entityLabel).join(', ')}
      <br />
    </>
  );
};

export default Article;
