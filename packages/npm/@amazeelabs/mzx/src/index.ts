import { program } from 'commander';
import { readFileSync } from 'fs';

import { extractCodeBlocks } from './extract';

export async function mzx() {
  program.argument('<file>');
  program.parse();
  if (program.args.length === 1) {
    const content = (await readFileSync(program.args[0])).toString();
    return extractCodeBlocks(content);
  }
}
