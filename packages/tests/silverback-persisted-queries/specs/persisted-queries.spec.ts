import { gatsby } from '@amazeelabs/silverback-playwright';
import { expect, Page, test } from '@playwright/test';

const doTest = async (page: Page, path: string) => {
  await page.goto(gatsby.baseUrl + path);
  // Give it time to fetch data.
  await page.waitForTimeout(2_000);

  // There should be 2 pages fetched with a query.
  await expect(page.locator('#pages-count')).toContainText('2');

  // The random number fetched with a mutation should change every second.
  await page.waitForTimeout(500); // For slow CI
  const rand1 = await page.innerText('#random-int');
  expect(rand1).toMatch(/^\d+$/);
  await page.waitForTimeout(2_000);
  const rand2 = await page.innerText('#random-int');
  expect(rand2).toMatch(/^\d+$/);
  expect(rand2).not.toEqual(rand1);
};

test('Test persisted queries with React Query', async ({ page }) => {
  await doTest(page, '/react-query-test');
});

test('Test persisted queries with GraphQL Request', async ({ page }) => {
  await doTest(page, '/graphql-request-test');
});
