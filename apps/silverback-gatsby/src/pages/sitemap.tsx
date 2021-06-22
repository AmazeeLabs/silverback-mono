import { graphql, Link, PageProps } from 'gatsby';
import React from 'react';

export const query = graphql`
  query Sitemap {
    drupalMainMenu(langcode: { eq: "en" }) {
      items {
        id
        parent
        label
        url
      }
    }
  }
`;

type TreeInput = {
  id: string;
  parent: string;
  label: string;
  url: string;
};

type TreeOutput = TreeInput & {
  children?: Array<TreeOutput>;
};

const buildTree = (
  items: Array<TreeInput>,
  parent: string = '',
): Array<TreeOutput> =>
  items
    .filter((item) => item.parent === parent)
    .map((item) => ({
      ...item,
      children: buildTree(items, item.id),
    }));

const RenderTree = ({ items }: { items: Array<TreeOutput> }) => (
  <ul>
    {items.map((item) => (
      <li key={item.id}>
        <Link to={item.url}>{item.label}</Link>
        {item.children ? <RenderTree items={item.children} /> : null}
      </li>
    ))}
  </ul>
);

const Sitemap: React.FC<PageProps<SitemapQuery>> = ({ data }) => (
  <div>
    <h1>Sitemap</h1>
    {data.drupalMainMenu && (
      <RenderTree items={buildTree(data.drupalMainMenu.items)} />
    )}
  </div>
);

export default Sitemap;
