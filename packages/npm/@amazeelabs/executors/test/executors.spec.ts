import { expect, test } from '@playwright/test';

['static', 'dynamic', 'client'].forEach((render) => {
  const cases = {
    Hardcoded: 'Hardcoded: 1 + 2 = 3',
    Delayed: 'Delayed: 2 + 3 = 5',
    Error: 'Error: I dont like 6es!',
    DelayedError: 'Error: I dont like 7s!',
  };
  Object.entries(cases).forEach(([label, expected]) => {
    test(`${render}: ${label}`, async ({ page }) => {
      await page.goto(`http://localhost:8080/${render}`);
      await expect(page.getByTestId(label)).toHaveText(expected);
    });
  });
});
