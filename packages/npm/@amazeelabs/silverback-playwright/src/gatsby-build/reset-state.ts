import axios from 'axios';

import { getConfig } from '../config';
import drupalResetState from '../drupal-only/reset-state';
import { axiosErrorHandler, log } from '../utils';
import { waitForGatsby } from '../wait-for-gatsby';

export default async function resetState() {
  log('gatsby-build resetState start');

  const { gatsby } = getConfig();
  await drupalResetState();
  await axios.post(gatsby.fastBuilds.rebuildUrl).catch(axiosErrorHandler);
  await waitForGatsby();

  log('gatsby-build resetState end');
}
