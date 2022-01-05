import {
  drupal,
  drupalLogin,
  gatsby,
  resetState,
  waitForGatsby,
} from '@amazeelabs/silverback-playwright';
import { expect, test } from '@playwright/test';
import os from 'os';
import { $, cd } from 'zx';

test.beforeAll(async () => {
  await resetState();
});

test('@gatsby-develop test LinkProcessor', async ({ page }) => {
  const selectFirstAutocompleteResult = async () =>
    page.click('.block-editor-link-control__search-results-wrapper button');
  const getNodeId = async () => {
    const editLink = await page.waitForSelector(
      '.tabs--primary :text-is("Edit")',
    );
    const href = await editLink.getAttribute('href');
    return href!.match(/\/node\/([0-9]+)/)![1];
  };
  const assertLinkHref = async (selector: string, expectedHref: string) => {
    const link = await page.waitForSelector(selector);
    const href = await link.getAttribute('href');
    expect(href).toEqual(expectedHref);
  };

  await drupalLogin(page);

  // Create a target page.

  await page.goto(`${drupal.baseUrl}/en/node/add/page`);
  await page.fill('label:text-is("Title")', 'Target page');
  await page.click(':text-is("URL alias")');
  await page.fill('label:text-is("URL alias")', '/target-page');
  await page.click(':text-is("Save")');

  const targetNodeId = await getNodeId();

  await page.click('.tabs--primary :text-is("Translate")');
  await page.click(':text-is("Add"):right-of(:text-is("German"))');
  await page.fill('label:text-is("URL alias")', '/target-page-de');
  await page.click('input:text-is("Save (this translation)")');

  // Create a Gutenberg page.

  await page.goto(`${drupal.baseUrl}/en/node/add/gutenberg_page`);
  await page.click('button[aria-label="Add block"]');

  await page.click(':text-is("Paragraph")');
  await page.type('[data-type="core/paragraph"]', 'link');
  await page.press(
    '[data-type="core/paragraph"]',
    os.platform() === 'darwin' ? 'Meta+a' : 'Control+a',
  );
  await page.click('[aria-label="Link"]');
  await page.fill('[placeholder="Search or type url"]', 'target page');
  await selectFirstAutocompleteResult();

  await page.click(':text-is("Teaser")');
  await page.type('[aria-label="Title"]', 'Teaser title');
  await page.type('[aria-label="Subtitle"]', 'Teaser subtitle');
  await page.fill('[placeholder="Search or type url"]', 'target page');
  await selectFirstAutocompleteResult();

  await page.click('.block-editor-inserter__menu :text-is("Media")');
  await page.click('button:text-is("Media Library") >> nth=-1');
  await page.check('input[name="media_library_select_form[0]"]');
  await page.click('button:text-is("Insert")');
  await page.fill('[aria-label="Write caption…"]', 'link');
  await page.keyboard.press(
    os.platform() === 'darwin'
      ? 'Meta+a'
      : // On Ubuntu, "Control+a" selects all Gutenberg blocks 🤯
        'Shift+Control+ArrowLeft',
  );
  await page.click('[aria-label="Link"]');
  await page.fill('[placeholder="Search or type url"]', 'target page');
  await selectFirstAutocompleteResult();

  await page.click('[aria-label="Settings"]');
  await page.click(':text-is("Document")');
  await page.fill('label:text-is("Title")', 'Test link processing');
  await page.click('input:text-is("Save")');

  const nodeId = await getNodeId();

  // Ensure that internal URLs are stored in Drupal database.

  cd(drupal.path);
  const result =
    await $`source .envrc && drush eval 'echo json_encode((new \\Drupal\\gutenberg\\Parser\\BlockParser())->parse(\\Drupal\\node\\Entity\\Node::load(${nodeId})->body->value));'`;
  const blocks = JSON.parse(result.stdout);

  expect(blocks).toHaveProperty('0.innerBlocks.0');
  const paragraphBlock = blocks[0].innerBlocks[0];
  expect(paragraphBlock.blockName).toEqual('core/paragraph');
  expect(paragraphBlock.innerHTML).toContain(`href="/node/${targetNodeId}"`);
  expect(paragraphBlock.innerContent[0]).toContain(
    `href="/node/${targetNodeId}"`,
  );

  expect(blocks).toHaveProperty('0.innerBlocks.1');
  const teaserBlock = blocks[0].innerBlocks[1];
  expect(teaserBlock.blockName).toEqual('custom/teaser');
  expect(teaserBlock.attrs.url).toEqual(`/node/${targetNodeId}`);

  expect(blocks).toHaveProperty('0.innerBlocks.2');
  const mediaBlock = blocks[0].innerBlocks[2];
  expect(mediaBlock.blockName).toEqual('drupalmedia/drupal-media-entity');
  expect(mediaBlock.attrs.caption).toContain(`href="/node/${targetNodeId}"`);

  // Ensure that URL aliases are used in the editor.

  await page.goto(`${drupal.baseUrl}/en/node/${nodeId}/edit`);
  await assertLinkHref('[data-type="core/paragraph"] a', '/en/target-page');
  await assertLinkHref('[data-type="custom/teaser"] a', '/en/target-page');
  await assertLinkHref(
    '[data-type="drupalmedia/drupal-media-entity"] a',
    '/en/target-page',
  );

  await waitForGatsby();

  // Ensure that URL aliases are used on the frontend.

  await page.goto(`${gatsby.baseUrl}/en/node/${nodeId}`);
  await page.waitForSelector('.gutenberg-body a');
  const links = await page.$$('.gutenberg-body a');
  expect(links).toHaveLength(3);
  for (const link of links) {
    expect(await link.getAttribute('href')).toEqual('/en/target-page');
  }

  // Ensure that URLs are correct when translating to German.

  await page.goto(`${drupal.baseUrl}/en/node/${nodeId}/translations`);
  await page.click(':text-is("Add"):right-of(:text-is("German"))');
  await assertLinkHref('[data-type="core/paragraph"] a', `/de/target-page-de`);
  await assertLinkHref('[data-type="custom/teaser"] a', '/de/target-page-de');
  await assertLinkHref(
    '[data-type="drupalmedia/drupal-media-entity"] a',
    '/de/target-page-de',
  );
});
