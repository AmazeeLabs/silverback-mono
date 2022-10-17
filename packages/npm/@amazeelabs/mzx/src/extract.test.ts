import { describe, expect, it } from 'vitest';

import { extractCodeBlocks } from './extract';

describe('extractCodeBlocks', () => {
  it('returns nothing if there are no code blocks', () => {
    expect(
      extractCodeBlocks(`
# Hello there!
    `),
    ).toEqual('');
  });

  it('returns a file with all code blocks in known languages', () => {
    expect(
      extractCodeBlocks(`
# Hello there!

\`\`\`typescript
await $\`pwd\`
\`\`\`

Something else

\`\`\`yaml
foo: bar
\`\`\`
    `),
    ).toEqual('await $`pwd`');
  });

  it('turns shell script blocks into zx shell commands', () => {
    expect(
      extractCodeBlocks(`
# Hello there!

\`\`\`shell
mkdir test
cd test
yarn init -y
\`\`\`
    `),
    ).toEqual(
      'await $`mkdir test`;\nawait $`cd test`;\nawait $`yarn init -y`;',
    );
  });

  it('writes annotated code blocks as files', () => {
    expect(
      extractCodeBlocks(`
# Hello there!

\`\`\`yaml
# |-> config/test.yaml
foo: bar
bar: baz
\`\`\`
    `),
    ).toEqual("await fs.writeFile('config/test.yaml', 'foo: bar\nbar: baz');");
  });
});
