import { getConfig } from './config';
import { getEnvVars } from './utils';

const config = getConfig();
const envVars = getEnvVars();

// These are to be used by tests, not by any of the silverback-playwright code.
export const drupal = config.drupal;
export const gatsby = {
  path: config.gatsby.path,
  port: config.gatsby.port,
  baseUrl: config.gatsby.baseUrl,
};
export const verbose = !!envVars.SP_VERBOSE;
