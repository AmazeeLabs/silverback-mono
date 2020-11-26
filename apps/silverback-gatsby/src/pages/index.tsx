import { graphql, PageProps, useStaticQuery } from 'gatsby';
import React from 'react';

const IndexPage: React.FC<PageProps> = () => {
  const {
    drupalNodePage: somePage,
    allDrupalNodeArticle: { nodes: articles },
  } = useStaticQuery<IndexPageQuery>(graphql`
    query IndexPage {
      drupalNodePage {
        entityLabel
        fieldBody {
          processed
        }
      }
      allDrupalNodeArticle {
        nodes {
          entityId
          entityLabel
          body {
            summaryProcessed
          }
          fieldTags {
            entity {
              ... on DrupalTaxonomyTermTags {
                entityLabel
              }
            }
          }
        }
      }
    }
  `);
  return (
    <>
      <b>Some page:</b>
      <br />
      <br />
      Title: {somePage?.entityLabel}
      <br />
      Body: {somePage?.fieldBody?.processed}
      <br />
      <br />
      <b>Now a list of articles with teasers:</b>
      <br />
      {articles.map((article) => (
        <div key={article.entityId}>
          <br />
          Title (click it):{' '}
          <a href={`/articles/${article.entityId}`}>{article.entityLabel}</a>
          <br />
          Summary: {article.body?.summaryProcessed}
          <br />
          Tags:{' '}
          {article.fieldTags?.map((it) => it?.entity?.entityLabel).join(', ')}
          <br />
        </div>
      ))}
    </>
  );
};

export default IndexPage;
