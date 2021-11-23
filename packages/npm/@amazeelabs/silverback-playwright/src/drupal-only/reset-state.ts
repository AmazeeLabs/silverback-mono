import { $, cd } from 'zx';

import { getConfig } from '../config';
import { log } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function resetState() {
  log('drupal-only resetState start');

  const { drupal } = getConfig();
  cd(drupal.path);
  await $`yarn snapshot-restore`;

  log('drupal-only resetState end');
}
