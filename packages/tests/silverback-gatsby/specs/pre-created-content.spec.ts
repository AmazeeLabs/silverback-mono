import { gatsby } from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';

test('not published article should not be visible', async ({ page }) => {
  await page.goto(gatsby.baseUrl);
  await expect(page.locator('a:text-is("Not published")')).not.toBeVisible();
});

test('other pre-created content', async ({ page }) => {
  await page.goto(gatsby.baseUrl);

  // Articles.
  await expect(page.locator('a:text-is("With everything")')).toBeVisible();
  await expect(page.locator('a:text-is("With everything DE")')).toBeVisible();
  await expect(page.locator('a:text-is("With everything FR")')).toBeVisible();
  await expect(page.locator('a:text-is("Article promoted")')).toBeVisible();

  await page.click('a:text-is("With everything")');

  // "With everything" article should have some images.
  await expect(page.locator('img[alt="Kitten alt text"]')).toBeVisible();
  await expect(page.locator('img[alt="Pug alt text"]')).toBeVisible();

  // "With everything" article should be translated to all languages.
  await expect(page.locator('a:text-is("German")')).toBeVisible();
  await expect(page.locator('a:text-is("French")')).toBeVisible();

  await page.goBack();

  // "Gutenberg page" page should have no translations.
  await page.click('a:text-is("Gutenberg page")');
  await expect(page.locator('a:text-is("German")')).not.toBeVisible();
  await expect(page.locator('a:text-is("French")')).not.toBeVisible();

  // After switching to "netlify dev" this does not work anymore. Even if the
  // html is rendered at this path 🤷
  // Also it does not seem to work when deployed to Netlify 🤔
  // Yet a simpler version "/en/page-ä/!<>/~-=" works.
  // TODO: Find out which exact characters are banned by Netlify.
  /*
  // Check the page with special chars in the path alias.
  await page.goto(gatsby.baseUrl + "/en/page-ä/!@$^&*(){}[]:|;'<>,.3/`~-=");
  await expect(page.locator('body')).toContainText(
    'This is a stub page for DrupalPage',
  );
  */
});
