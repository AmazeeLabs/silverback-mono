import { graphql, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql`
  query CustomSchema {
    pages {
      id
      title
    }
    page(id: "Page:2:en") {
      title
    }
  }
`;

export default function CustomSchema(props: PageProps<CustomSchemaQuery>) {
  return (
    <div>
      {props.data.pages?.map((page) => (
        <p key={page?.id}>{`${page?.title} (${page?.id})`}</p>
      ))}
      <p>{`Load: ${props.data.page?.title}`}</p>
    </div>
  );
}
