import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import Code from './Code';

export default {
  title: 'Atoms/Code',
  componend: Code,
} as Meta;

const MDXCode: React.FC<{
  mdxType: 'code';
  className: string;
}> = ({ children }) => <code>{children}</code>;

export const Javascript: Story = () => (
  <div className="prose-xl">
    <Code>
      <MDXCode mdxType="code" className="language-javascript">
        {`
const foo = ["bar", "baz"];
console.log(foo.map(v => v.toUpperCase()));
`}
      </MDXCode>
    </Code>
  </div>
);

export const Typescript: Story = () => (
  <div className="prose-xl">
    <Code>
      <MDXCode mdxType="code" className="language-typescript">
        {`
const greet = (who: string) => console.log(\`Hello \${who}!\`);
greet('World');
`}
      </MDXCode>
    </Code>
  </div>
);

export const Markup: Story = () => (
  <div className="prose-xl">
    <Code>
      <MDXCode mdxType="code" className="language-markup">
        {`
<div class="teaser">
  <h3>This is interesting</h3>
  <p>You should totally read this</p>
  <a href="/interesting">Learn more</a>
</div>
`}
      </MDXCode>
    </Code>
  </div>
);
