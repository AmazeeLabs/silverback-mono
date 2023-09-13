import {
  drupal,
  drupalLogin,
  gatsby,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, PlaywrightTestArgs, test } from '@playwright/test';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-both basic updates', async ({ page }) => {
  const title = 'Test update';
  const initialBodyText = 'Initial body text';
  const updatedBodyText = 'Updated body text';

  await drupalLogin(page);

  await page.goto(`${drupal.baseUrl}/node/add/article`);
  await page.type('#edit-title-0-value', title);
  await fillCkeditor(page, initialBodyText);
  await page.click('#edit-submit');
  await waitForGatsby();

  const pagePath = new URL(page.url()).pathname;

  await page.goto(`${gatsby.baseUrl}${pagePath}`);
  await expect(page.locator('body')).toContainText(initialBodyText);

  await page.goto(`${drupal.baseUrl}${pagePath}/edit`);
  await fillCkeditor(page, updatedBodyText);
  await page.click('#edit-submit');
  await waitForGatsby();

  await page.goto(`${gatsby.baseUrl}${pagePath}`);
  await expect(page.locator('body')).not.toContainText(initialBodyText);
  await expect(page.locator('body')).toContainText(updatedBodyText);
});

test('@gatsby-develop create unpublished content', async ({ page }) => {
  const title = 'Another unpublished article';

  await drupalLogin(page);

  await page.goto(gatsby.baseUrl);
  await expect(page.locator(`a:text-is("${title}")`)).not.toBeVisible();

  await page.goto(`${drupal.baseUrl}/node/add/article`);
  await page.type('#edit-title-0-value', title);
  await page.uncheck('label:text-is("Published")');
  await page.click('#edit-submit');
  await waitForGatsby();

  await page.goto(gatsby.baseUrl);
  await expect(page.locator(`a:text-is("${title}")`)).toBeVisible();
});

test('@gatsby-build create unpublished content, then publish it, then unpublish it again', async ({
  page,
}) => {
  const title = 'It will blink';

  await drupalLogin(page);

  await page.goto(`${drupal.baseUrl}/node/add/article`);
  await page.type('#edit-title-0-value', title);
  await page.uncheck('label:text-is("Published")');
  await page.click('#edit-submit');
  await waitForGatsby();

  const pagePath = new URL(page.url()).pathname;

  await page.goto(gatsby.baseUrl);
  await expect(page.locator(`a:text-is("${title}")`)).not.toBeVisible();

  await page.goto(`${drupal.baseUrl}${pagePath}/edit`);
  await page.check('label:text-is("Published")');
  await page.click('#edit-submit');
  await waitForGatsby();

  await page.goto(gatsby.baseUrl);
  await expect(page.locator(`a:text-is("${title}")`)).toBeVisible();

  await page.goto(`${drupal.baseUrl}${pagePath}/edit`);
  await page.uncheck('label:text-is("Published")');
  await page.click('#edit-submit');
  await waitForGatsby();

  await page.goto(gatsby.baseUrl);
  await expect(page.locator(`a:text-is("${title}")`)).not.toBeVisible();
});

const fillCkeditor = async (page: PlaywrightTestArgs['page'], text: string) => {
  const editorFrame = (await (
    await page.waitForSelector('iframe.cke_wysiwyg_frame')
  )?.contentFrame())!;
  await editorFrame.fill('body', '');
  await editorFrame.fill('body', text);
};
