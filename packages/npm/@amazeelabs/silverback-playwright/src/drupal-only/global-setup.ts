import { $, cd, fs } from 'zx';

import { drupal } from '../constants';
import { log, port } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function globalSetup() {
  log('drupal-only globalSetup start');

  cd(drupal.path);

  if (fs.existsSync(`${drupal.path}/.silverback-snapshots/test`)) {
    await $`yarn snapshot-restore`;
  } else {
    await $`yarn setup`;
    await $`yarn snapshot-create`;
  }

  await port.killIfUsed(drupal.port);
  $`TEST_SESSION_ENABLED=true yarn start`;
  await port.waitUntilUsed(drupal.port);

  log('drupal-only globalSetup end');
}
