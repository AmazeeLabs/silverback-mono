import { program } from 'commander';

import { defaultFragmentsPath, generate } from "./generate";

program.name('gatsby-fragments');
program.command('generate')
  .option('-p, --path <string>', 'Optional path to TypeScript fragment files.', defaultFragmentsPath)
  .action(generate);

program.parse();
