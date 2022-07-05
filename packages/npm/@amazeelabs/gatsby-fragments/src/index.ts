import { program } from 'commander';

import { defaultTypeScriptFragmentsPath, generate } from "./generate";

program.name('gatsby-fragments');
program.command('generate')
  .option('-p, --path <string>', 'Optional path to TypeScript fragment files.', defaultTypeScriptFragmentsPath)
  .action(generate);

program.parse();
