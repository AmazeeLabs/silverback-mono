import { Code, Content } from 'mdast';
import remarkParse from 'remark-parse';
import { unified } from 'unified';

type BlockHandler = (input: string) => string;

const handlers: Record<string, BlockHandler> = {
  typescript: (input: string) => input,
};

export function preprocess(input: Array<CodeBlock>) {
  return input
    .filter((block) => !!handlers[block.lang])
    .map((block) => handlers[block.lang](block.content));
}

function isCodeBlock(content: Content): content is Code & { lang: string } {
  return content.type === 'code' && !!content.lang && !!content.value;
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
  ).join('\n');
}
