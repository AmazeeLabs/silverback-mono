import { pluginTester } from 'babel-plugin-tester';

import plugin from './plugin.js';

pluginTester({
  plugin,
  pluginOptions: {
    operations: `./test/operations.json`,
  },
  babelOptions: {
    presets: [
      '@babel/preset-react',
      ['@babel/preset-typescript', { isTSX: true, allExtensions: true }],
    ],
  },
  tests: [
    {
      title: 'Page query',
      code: `
import { MyOperation } from '@custom/schema';
import { graphql } from '@amazeelabs/gatsby-plugin-operations';
export const query = graphql(MyOperation);
      `,
      output: `
import { MyOperation } from '@custom/schema';
import { graphql } from 'gatsby';
export const query = graphql\`
  {
    field
  }
\`;`,
    },
    {
      title: 'Static query',
      code: `
import { MyOperation } from '@custom/schema';
import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
function useData() {
  return useStaticQuery(graphql(MyOperation));
}`,
      output: `
import { MyOperation } from '@custom/schema';
import { graphql, useStaticQuery } from 'gatsby';
function useData() {
  return useStaticQuery(
    graphql\`
      {
        field
      }
    \`,
  );
}`,
    },
    {
      title: 'Typescript',
      code: `
import { MyOperation } from '@custom/schema';
import { graphql, useStaticQuery } from '@amazeelabs/gatsby-plugin-operations';
function useData() {
  return useStaticQuery(graphql(MyOperation));
}

export function Component(props: { message: string }) {
  return <div>{props.message}</div>;
}
`,
      output: `
import { MyOperation } from '@custom/schema';
import { graphql, useStaticQuery } from 'gatsby';
function useData() {
  return useStaticQuery(
    graphql\`
      {
        field
      }
    \`,
  );
}
export function Component(props) {
  return /*#__PURE__*/ React.createElement('div', null, props.message);
}`,
    },
  ],
});
