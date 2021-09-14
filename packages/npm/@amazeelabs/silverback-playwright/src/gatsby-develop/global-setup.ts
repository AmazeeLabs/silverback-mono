import { $, cd } from 'zx';

import { gatsby } from '../constants';
import drupalGlobalSetup from '../drupal-only/global-setup';
import { port } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function globalSetup() {
  await drupalGlobalSetup();

  cd(gatsby.path);
  await port.killIfUsed(gatsby.port);
  await $`yarn clean`;
  // Load env vars right before starting Gatsby so that it sees them.
  $`source .envrc && yarn develop`;
  await port.waitUntilUsed(
    gatsby.port,
    gatsby.timings.retryInterval,
    gatsby.timings.startTimeout,
  );

  // Do not waitForGatsby here. Reasons:
  // - test will call resetState which does it anyways
  // - if we do it, Gatsby will crash with crazy error 🤷
  //   (yoga-layout/build/Release/nbind.js address already in use)
}
