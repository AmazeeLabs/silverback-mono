import { waitForGatsby } from '@amazeelabs/silverback-playwright';
import { test } from '@playwright/test';

test('setup', async () => {
  await waitForGatsby();
});
