import { $, cd } from 'zx';

import { drupal } from '../constants';

$.verbose = !!process.env.SP_VERBOSE;

export default async function resetState() {
  cd(drupal.path);
  await $`yarn snapshot-restore`;
}
