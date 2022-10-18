import { program } from 'commander';
import * as Diff from 'diff';
import fs, { readFileSync } from 'fs';

import { extractCodeBlocks } from './extract';

export async function mzx(zx: () => void) {
  program
    .command('compile')
    .argument('<file>', 'The script to compile.')
    .action(async (file) => {
      const content = (await readFileSync(file)).toString();
      const processed = extractCodeBlocks(content);
      process.stdout.write(processed);
    });

  program
    .command('run')
    .argument('<file>', 'The script to run.')
    .action(async (file) => {
      const content = (await readFileSync(file)).toString();
      const processed = extractCodeBlocks(content);
      process.argv = [
        ...process.argv.slice(0, 2),
        '--install',
        '-e',
        processed,
      ];
      zx();
    });

  program
    .command('diff')
    .argument('<file_a>')
    .argument('<file_b>')
    .action(async (fileA, fileB) => {
      process.stdout.write(
        Diff.createPatch(
          fileA,
          fs.readFileSync(fileA).toString(),
          fs.readFileSync(fileB).toString(),
        ),
      );
    });
  program.parse();
}
