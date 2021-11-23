import { $, cd } from 'zx';

import { getConfig } from '../config';
import drupalGlobalSetup from '../drupal-only/global-setup';
import { log, port } from '../utils';

$.verbose = !!process.env.SP_VERBOSE;

export default async function globalSetup() {
  log('gatsby-develop globalSetup start');

  const { gatsby } = getConfig();
  await drupalGlobalSetup();

  cd(gatsby.path);
  await port.killIfUsed(gatsby.allPorts);
  await $`yarn clean`;
  // Load env vars right before starting Gatsby so that it sees them.
  const process = $`source .envrc && yarn develop`;

  // Wait until Gatsby outputs
  //   You can now view {your app} in the browser.
  //   http://localhost:8000/
  // Before this happens, it's really dangerous to touch Gatsby. It can crash.
  await new Promise<void>((resolve) => {
    const event = 'data';
    const listener = (chunk: any) => {
      const string: string = chunk.toString();
      if (string.includes(gatsby.baseUrl)) {
        process.stdout.removeListener(event, listener);
        resolve();
      }
    };
    process.stdout.addListener(event, listener);
  });

  log('gatsby-develop globalSetup end');
}
