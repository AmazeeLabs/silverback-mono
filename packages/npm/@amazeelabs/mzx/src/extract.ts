import { Code, Content } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

type BlockHandler = (input: CodeBlock) => CodeBlock | undefined;

const handlers: Record<string, BlockHandler> = {
  shell: (input: CodeBlock) => {
    if (['shell'].includes(input.lang)) {
      return {
        lang: `typescript`,
        content: input.content
          .split('\n')
          .map((line) => `await $\`${line}\`;`)
          .join('\n'),
      };
    }
    return undefined;
  },
  typescript: (input: CodeBlock) =>
    input.lang === 'typescript' ? input : undefined,
};

export function preprocess(input: Array<CodeBlock>) {
  return input
    .filter((block) => !!handlers[block.lang])
    .map((block) => handlers[block.lang](block));
}

function isCodeBlock(content: Content): content is Code & { lang: string } {
  return content.type === 'code' && !!content.lang && !!content.value;
}

function isDefined<T extends any>(input: T | undefined): input is T {
  return typeof input !== 'undefined';
}

export type CodeBlock = {
  lang: string;
  content: string;
};

export function extractCodeBlocks(input: string): string {
  const root = unified().use(remarkParse).parse(input);
  return preprocess(
    root.children.filter(isCodeBlock).map((block) => ({
      lang: block.lang,
      content: block.value,
    })),
  )
    .filter(isDefined)
    .map((block) => block.content)
    .join('\n');
}
