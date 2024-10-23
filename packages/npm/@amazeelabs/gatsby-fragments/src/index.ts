import { program } from 'commander';

import { defaultFragmentsPath, generate } from './generate';

program.name('gatsby-fragments');
program
  .command('generate')
  .option(
    '-p, --path <string>',
    'Optional path to GraphQL fragment files.',
    defaultFragmentsPath,
  )
  .option(
    '-a, --aggregate <string>',
    'Optional path to a typescript gatsby fragment output file.',
  )
  .option('--skip', 'Don\'t add a "Drupal" prefix to types.')
  .action(generate);

program.parse();
