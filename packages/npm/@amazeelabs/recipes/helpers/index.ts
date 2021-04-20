import * as files from './files';
import * as logger from './logger';
import * as process from './process';
import * as prompts from './prompts';
import * as versions from './versions';

// "Run" is the most common command, and can be invoked directly with $('...')
const $: typeof process.run &
  typeof process &
  typeof logger &
  typeof files &
  typeof prompts &
  typeof versions = Object.assign(process.run, {
  ...process,
  ...logger,
  ...versions,
  ...prompts,
  ...files,
});

export default $;
