import { graphql, PageProps, useStaticQuery } from 'gatsby';
import React from 'react';

import {
  ImageSet,
  renderHtml,
} from '../../plugins/gatsby-plugin-images-from-html/render-html';

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
        childrenImagesFromHtml {
          url
          localImage {
            ...ImageSharpFixed
          }
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

  const imageSets: ImageSet[] = [];
  for (const childImage of somePage?.childrenImagesFromHtml || []) {
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
      <b>Some page:</b>
      <br />
      <br />
      Title: {somePage?.entityLabel}
      <br />
      Body:{' '}
      <div className="html-from-drupal">
        {somePage?.fieldBody?.processed &&
          renderHtml(somePage.fieldBody.processed, imageSets)}
      </div>
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
