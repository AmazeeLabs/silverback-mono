import * as files from './files';
import * as logger from './logger';
import { run } from './process';
import * as prompts from './prompts';
import * as versions from './versions';

// "Run" is the most common command, and can be invoked directly with $('...')
const $: typeof run &
  typeof logger &
  typeof files &
  typeof prompts &
  typeof versions = Object.assign(run, {
  ...logger,
  ...versions,
  ...prompts,
  ...files,
});

export default $;
