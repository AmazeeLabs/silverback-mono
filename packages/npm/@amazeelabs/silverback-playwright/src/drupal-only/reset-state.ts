import { $, cd } from 'zx';

import { drupal } from '../constants';
import { log } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function resetState() {
  log('drupal-only resetState start');

  cd(drupal.path);
  await $`yarn snapshot-restore`;

  log('drupal-only resetState end');
}
