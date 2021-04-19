import * as files from './files';
import * as logger from './logger';
import * as process from './process';
import * as prompts from './prompts';
import * as versions from './versions';

export default {
  ...process,
  ...logger,
  ...versions,
  ...prompts,
  ...files,
};
