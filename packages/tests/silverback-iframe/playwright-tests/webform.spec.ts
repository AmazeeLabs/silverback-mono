import {
  drupal,
  drupalLogin,
  drupalLogout,
  gatsby,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, PlaywrightTestArgs, test } from '@playwright/test';
import { $, cd } from 'zx';

import { getIframe } from './common';

test.beforeAll(async () => {
  await resetState();
});

test('@drupal-only the unsupported confirmation type is replaced with the default value', async ({
  page,
}) => {
  cd(drupal.path);
  const result =
    await $`source .envrc && drush cget webform.webform.for_testing_confirmation_options settings.confirmation_type --include-overridden --format=json`;
  const confirmationType = Object.values(JSON.parse(result.stdout))[0];
  expect(confirmationType).toEqual('page');

  await drupalLogin(page);
  await page.goto(
    `${drupal.baseUrl}/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
  );
  await expect(
    page.locator('input[name="confirmation_type"][value="inline"]'),
  ).toBeChecked();
});

test('@drupal-only only allowed confirmation types are listed in the webform config', async ({
  page,
}) => {
  await drupalLogin(page);
  await page.goto(
    `${drupal.baseUrl}/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
  );
  const options = await Promise.all(
    (
      await page.$$('input[name="confirmation_type"]')
    ).map((option) => option.getAttribute('value')),
  );
  expect(options).toEqual(confirmationOptions);
});

test('@gatsby-both confirmation type: inline', async ({ page }) => {
  await setConfirmationOption(page, 'inline', { addMessage: true });
  await submitWebform(page);

  expect(await page.innerHTML('.status-messages-inner')).toContain(
    'Test message with&nbsp;<strong>some bold text.</strong>',
  );
  expect(await page.$('iframe')).toBeNull();
});

test('@gatsby-both confirmation type: message', async ({ page }) => {
  await setConfirmationOption(page, 'message', { addMessage: true });
  await submitWebform(page);

  expect(await page.innerHTML('.status-messages-inner')).toContain(
    'Test message with&nbsp;<strong>some bold text.</strong>',
  );
  expect(await page.$('iframe')).not.toBeNull();
});

test('@gatsby-both confirmation type: url', async ({ page }) => {
  await setConfirmationOption(page, 'url', {
    setRedirectUrl: '/en/article/with-everything',
  });
  await submitWebform(page);
  await page.waitForNavigation();

  expect(page.url()).toBe(
    // It's important to ensure that we are redirected to Gatsby, not to Drupal.
    `${gatsby.baseUrl}/en/article/with-everything`,
  );
});

test('@gatsby-both confirmation type: url_message', async ({ page }) => {
  await setConfirmationOption(page, 'url_message', {
    addMessage: true,
    setRedirectUrl: '/en/article/other',
  });
  await submitWebform(page);
  await page.waitForNavigation();

  expect(await page.innerHTML('.status-messages-inner')).toContain(
    'Test message with&nbsp;<strong>some bold text.</strong>',
  );
  expect(page.url()).toBe(
    // It's important to ensure that we are redirected to Gatsby, not to Drupal.
    `${gatsby.baseUrl}/en/article/other`,
  );
});

test('@gatsby-both confirmation type: none', async ({ page }) => {
  await setConfirmationOption(page, 'none');
  await submitWebform(page);

  expect(await page.$('iframe')).not.toBeNull();
  expect(await page.$('.status-messages-inner')).toBeNull();
});

const confirmationOptions = [
  'inline',
  'message',
  'url',
  'url_message',
  'none',
] as const;
type ConfirmationOption = typeof confirmationOptions[number];

const setConfirmationOption = async (
  page: PlaywrightTestArgs['page'],
  confirmationOption: ConfirmationOption,
  options?: { addMessage?: boolean; setRedirectUrl?: string },
) => {
  await drupalLogin(page);
  await page.goto(
    `${drupal.baseUrl}/en/admin/structure/webform/manage/for_testing_confirmation_options/settings/confirmation`,
  );

  await page.click(
    `input[name="confirmation_type"][value="${confirmationOption}"]`,
  );

  if (options?.addMessage) {
    const editorFrame = (await (
      await page.waitForSelector(
        '.form-item--confirmation-message-value .cke_wysiwyg_frame',
      )
    )?.contentFrame())!;
    // Filling with an empty string helps Playwright do the things right.
    await editorFrame.fill('body', '');
    await editorFrame.fill('body', 'Test message with ');
    await page.click(
      '.form-item--confirmation-message-value .cke_button__bold',
    );
    await page.keyboard.type('some bold text.');
  }

  if (options?.setRedirectUrl) {
    await page.fill('input[name=confirmation_url]', options.setRedirectUrl);
  }

  await page.click('text=Save');
  await waitForGatsby();
  await drupalLogout(page);
};

const submitWebform = async (page: PlaywrightTestArgs['page']) => {
  await page.goto(`${gatsby.baseUrl}/en/form/for-testing-confirmation-options`);
  const iframe = await getIframe(page);
  await iframe.click('text=Submit');
};
