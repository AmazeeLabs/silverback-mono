import { describe, expect, it } from 'vitest';

import { extractCodeBlocks } from './extract';

function assertCodeBlocks(input: Array<string>, output: Array<string>) {
  expect(extractCodeBlocks(input.join('\n'))).toEqual(output.join('\n'));
}

describe('extractCodeBlocks', () => {
  it('returns nothing if there are no code blocks', () => {
    assertCodeBlocks(['# Hello there'], []);
  });

  it('returns a file with all code blocks in known languages', () => {
    assertCodeBlocks(
      [
        '# Hello there, i am a executable script',
        '',
        '```typescript',
        'await $`pwd`',
        '```',
      ],
      ['await $`pwd`'],
    );
  });

  it('turns shell script blocks into zx shell commands', () => {
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```shell',
        'mkdir test',
        'cd test',
        'yarn init -y',
        '```',
      ],
      ['await $`mkdir test`;', 'await $`cd test`;', 'await $`yarn init -y`;'],
    );
  });

  it('writes annotated code blocks as files', () => {
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```yaml',
        '# |-> config/test.yaml',
        'foo: bar',
        'bar: baz',
        '```',
      ],
      ["await fs.writeFile('config/test.yaml', 'foo: bar\nbar: baz');"],
    );
  });

  it('interpolates upper-cased environment variables into files and filenames', () => {
    process.env.PROJECT_NAME = 'my_project';
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```yaml',
        '# |-> config/PROJECT_NAME.yaml',
        'foo: bar',
        'bar: PROJECT_NAME',
        '```',
      ],
      [
        "await fs.writeFile('config/' + (process.env.PROJECT_NAME || 'PROJECT_NAME') + '.yaml', 'foo: bar\nbar: ' + (process.env.PROJECT_NAME || 'PROJECT_NAME') + '');",
      ],
    );
  });
});
