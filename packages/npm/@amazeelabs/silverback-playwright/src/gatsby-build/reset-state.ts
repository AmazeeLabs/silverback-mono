import axios from 'axios';

import { gatsby } from '../constants';
import drupalResetState from '../drupal-only/reset-state';
import { waitForGatsby } from '../wait-for-gatsby';

export default async function resetState() {
  await drupalResetState();
  await axios.post(gatsby.fastBuilds.rebuildUrl);
  await waitForGatsby();
}
