import { describe, expect, it } from 'vitest';

import { extractCodeBlocks } from './extract';

function assertCodeBlocks(input: Array<string>, output: Array<string>) {
  const extracted = extractCodeBlocks(input.join('\n'));
  const expected = output.join('\n');
  expect(extracted).toEqual(expected);
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
        'pnpm init -y',
        '```',
      ],
      ['await $`mkdir test`;', 'await $`cd test`;', 'await $`pnpm init -y`;'],
    );
  });

  it('writes annotated code blocks as files', () => {
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```yaml title="./config/test.yaml"',
        'foo: bar',
        'bar: baz',
        '```',
      ],
      ['await fs.writeFile(`config/test.yaml`, `foo: bar\nbar: baz`);'],
    );
  });

  it('does not execute typescript codeblocks with file annotations', () => {
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```typescript title="./test.ts"',
        'console.log(`Hello world\\n`);',
        '```',
      ],
      [
        'await fs.writeFile(`test.ts`, `console.log(\\`Hello world\\\\n\\`);`);',
      ],
    );
  });

  it('does not break when writing github actions', () => {
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```typescript title="./action.yml"',
        'something: ${{ github.token }}',
        '```',
      ],
      [
        `await fs.writeFile(\`action.yml\`, \`something: \\\${{ github.token }}\`);`,
      ],
    );
  });

  it('interpolates upper-cased environment variables into files and filenames', () => {
    process.env.PROJECT_NAME = 'my_project';
    assertCodeBlocks(
      [
        '# Hello there!',
        '',
        '```yaml title="./config/PROJECT_NAME.yaml"',
        'foo: bar',
        'bar: PROJECT_NAME',
        '```',
      ],
      [
        "await fs.writeFile(`config/` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `.yaml`, `foo: bar\nbar: ` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + ``);",
      ],
    );
  });

  it('applies patch diffs', () => {
    const patch = [
      'Index: a.txt',
      '===================================================================',
      '--- a.txt',
      '+++ a.txt',
      '@@ -1,3 +1,4 @@',
      'This is',
      'some',
      '+more',
      'content.',
    ];
    assertCodeBlocks(
      ['```diff', ...patch, '```'],
      ['await patchFile(`a.txt`, `' + patch.join('\n') + '`);'],
    );
  });

  it('interpolates upper-cased environment variables while applying patch diffs', () => {
    process.env.PROJECT_NAME = 'my_project';
    const patch = [
      'Index: PROJECT_NAME.txt',
      '===================================================================',
      '--- PROJECT_NAME.txt',
      '+++ PROJECT_NAME.txt',
      '@@ -1,3 +1,4 @@',
      'This is',
      'some',
      '+PROJECT_NAME',
      'content.',
    ];
    const sanitized = [
      "Index: ` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `.txt",
      '===================================================================',
      "--- ` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `.txt",
      "+++ ` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `.txt",
      '@@ -1,3 +1,4 @@',
      'This is',
      'some',
      "+` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `",
      'content.',
    ];

    assertCodeBlocks(
      ['```diff', ...patch, '```'],
      [
        "await patchFile(`` + (process.env.PROJECT_NAME || 'PROJECT_NAME') + `.txt`, `" +
          sanitized.join('\n') +
          '`);',
      ],
    );
  });
});
