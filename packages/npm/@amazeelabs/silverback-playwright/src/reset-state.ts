import axios from 'axios';

import { spServeBaseUrl } from './constants';
import { getEnvVars } from './utils';

export default async function resetState() {
  const envVars = getEnvVars();
  await axios.post(`${spServeBaseUrl}/${envVars.SP_TEST_TYPE}-reset`, envVars);
}
