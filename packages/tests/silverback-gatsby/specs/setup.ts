import {
  resetDrupalState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { test } from '@playwright/test';

test('setup', async () => {
  await resetDrupalState();
  await waitForGatsby();
});
