import axios from 'axios';

import { gatsby } from '../constants';
import drupalResetState from '../drupal-only/reset-state';
import { waitForGatsby } from '../wait-for-gatsby';

export default async function resetState() {
  await drupalResetState();
  try {
    await axios.post(
      `${gatsby.baseUrl}/__refresh`,
      {
        // This triggers full content fetch.
        buildId: 0,
      },
      {
        timeout: gatsby.timings.httpCallTimeout,
      },
    );
  } catch (e) {
    // Can happen if Gatsby is starting. Does not make sense to report.
  }
  await waitForGatsby();
}
