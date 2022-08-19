import { $, cd, nothrow } from 'zx';

import { getConfig } from '../config';
import drupalGlobalSetup from '../drupal-only/global-setup';
import { log, port } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function globalSetup() {
  log('gatsby-build globalSetup start');

  const { gatsby } = getConfig();
  await drupalGlobalSetup();

  cd(gatsby.path);
  await port.killIfUsed(gatsby.allPorts);
  await $`yarn clean`;
  // Load env vars right before starting Gatsby so that it sees them.
  nothrow(
    $`source .envrc && DRUPAL_GRAPHQL_PATH=${gatsby.drupal.graphQlEndpoint} DRUPAL_AUTH_KEY=${gatsby.drupal.authKey} yarn fast-builds:serve:local`,
  );
  await port.waitUntilUsed(
    gatsby.port,
    gatsby.timings.retryInterval,
    gatsby.timings.startTimeout,
  );

  log('gatsby-build globalSetup end');
}
