import gql from 'noop-tag';
import { describe, expect, test } from 'vitest';

import { fetch } from '../lib.js';

describe('content', () => {
  test('Page', async () => {
    const result = await fetch(gql`
      fragment Page on Page {
        __typename
        id: _id
        drupalId: _drupalId
        title
        langcode: _langcode
        body
        defaultTranslation: _defaultTranslation
        path
        translations: _translations {
          langcode: _langcode
          defaultTranslation: _defaultTranslation
        }
        paragraphs {
          __typename
          ... on ParagraphText {
            text
          }
          ... on ParagraphReferences {
            singleReference {
              id: _id
            }
            references {
              id: _id
            }
          }
        }
      }
      {
        basic: _loadPage(id: "a38bce61-3640-4799-bacf-18ccc6e74216") {
          ...Page
        }
        references: _loadPage(id: "bb230ced-eb4d-495f-9571-50a7f6f69e67") {
          ...Page
        }
      }
    `);
    (Object.values(result.data) as Array<{ path: string }>).forEach((page) => {
      page.path = page.path.replace(/\d+/, '[numeric]');
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "basic": {
            "__typename": "Page",
            "body": "<p>Some text.</p>
      ",
            "defaultTranslation": true,
            "drupalId": "a38bce61-3640-4799-bacf-18ccc6e74216",
            "id": "a38bce61-3640-4799-bacf-18ccc6e74216:en",
            "langcode": "en",
            "paragraphs": [],
            "path": "/en/page/a-page",
            "title": "A page",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
              {
                "defaultTranslation": false,
                "langcode": "de",
              },
            ],
          },
          "references": {
            "__typename": "Page",
            "body": null,
            "defaultTranslation": true,
            "drupalId": "bb230ced-eb4d-495f-9571-50a7f6f69e67",
            "id": "bb230ced-eb4d-495f-9571-50a7f6f69e67:en",
            "langcode": "en",
            "paragraphs": [
              {
                "__typename": "ParagraphText",
                "text": "Some text.",
              },
              {
                "__typename": "ParagraphReferences",
                "references": [
                  {
                    "id": "7702e639-4704-4599-a8b5-a65d88c61ea3:en",
                  },
                  {
                    "id": "80b65cc6-5f5f-4113-a52b-c00d3bd0bfe9:en",
                  },
                ],
                "singleReference": {
                  "id": "af2bb5e4-237a-4e76-befe-e7a3d8dc699c:en",
                },
              },
            ],
            "path": "/en/node/[numeric]",
            "title": "Page with paragraphs",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
            ],
          },
        },
      }
    `);
  });

  test('Article', async () => {
    const result = await fetch(gql`
      fragment Article on Article {
        __typename
        id: _id
        drupalId: _drupalId
        title
        langcode: _langcode
        body
        image {
          id: _id
        }
        tags {
          id: _id
        }
        defaultTranslation: _defaultTranslation
        path
        template
        translations: _translations {
          langcode: _langcode
          defaultTranslation: _defaultTranslation
        }
      }
      {
        complete: _loadArticle(id: "c997198a-a4a5-484a-8567-46ca6a24301a") {
          ...Article
        }
        minimal: _loadArticle(id: "80b65cc6-5f5f-4113-a52b-c00d3bd0bfe9") {
          ...Article
        }
        promoted: _loadArticle(id: "7702e639-4704-4599-a8b5-a65d88c61ea3") {
          template
        }
        unpublished: _loadArticle(id: "a86ca24a-e4f9-4a7d-ac4e-26b61b9db974") {
          title
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "complete": {
            "__typename": "Article",
            "body": "<p><strong>Article</strong> <em>body</em>.</p>

      <p>Pug is embedded 👇&nbsp;</p>

      <article class="media media--type-image media--view-mode-default" data-align="center">
        
            
        <div class="field field--name-field-media-image field--type-image field--label-visually_hidden">
          <div class="field__label visually-hidden">Image</div>
                    <div class="field__item">  <img loading="lazy" src="/sites/default/files/2021-01/image_jpg_pug.jpg" width="1920" height="1080" alt="Pug alt text">

      </div>
                </div>

        </article>


      <p>Kitten goes&nbsp;in a separate field 👉</p>
      ",
            "defaultTranslation": true,
            "drupalId": "c997198a-a4a5-484a-8567-46ca6a24301a",
            "id": "c997198a-a4a5-484a-8567-46ca6a24301a:en",
            "image": {
              "id": "fd3a7238-807a-483d-a703-c9b1b6b4a8e8:en",
            },
            "langcode": "en",
            "path": "/en/article/with-everything",
            "tags": [
              {
                "id": "cfc1e9c7-3fb8-43a9-982a-756d72dc4f86:en",
              },
              {
                "id": "5abb8be2-d3ab-44ea-8dc1-dfdbaf02c08f:en",
              },
            ],
            "template": null,
            "title": "With everything",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
              {
                "defaultTranslation": false,
                "langcode": "de",
              },
              {
                "defaultTranslation": false,
                "langcode": "fr",
              },
            ],
          },
          "minimal": {
            "__typename": "Article",
            "body": null,
            "defaultTranslation": true,
            "drupalId": "80b65cc6-5f5f-4113-a52b-c00d3bd0bfe9",
            "id": "80b65cc6-5f5f-4113-a52b-c00d3bd0bfe9:en",
            "image": null,
            "langcode": "en",
            "path": "/en/article/other",
            "tags": [],
            "template": null,
            "title": "Other article",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
            ],
          },
          "promoted": {
            "template": "article-promoted",
          },
          "unpublished": null,
        },
      }
    `);
  });

  test('GutenbergPage', async () => {
    const result = await fetch(gql`
      fragment GutenbergPage on GutenbergPage {
        __typename
        id: _id
        drupalId: _drupalId
        title
        langcode: _langcode
        body {
          ...BlockHtmlParagraph
          ...BlockHtmlList
          ...BlockHtmlQuote
          ...BlockImage
          ...BlockTeaser
          ... on BlockTwoColumns {
            __typename
            children {
              __typename
              children {
                ...BlockHtmlParagraph
                ...BlockHtmlList
                ...BlockHtmlQuote
                ...BlockImage
                ...BlockTeaser
              }
            }
          }
        }
        defaultTranslation: _defaultTranslation
        path
        translations: _translations {
          langcode: _langcode
          defaultTranslation: _defaultTranslation
        }
      }

      fragment BlockHtmlParagraph on BlockHtmlParagraph {
        __typename
        html
      }
      fragment BlockHtmlList on BlockHtmlList {
        __typename
        html
      }
      fragment BlockHtmlQuote on BlockHtmlQuote {
        __typename
        html
      }
      fragment BlockImage on BlockImage {
        __typename
        image {
          id: _id
        }
        caption
      }
      fragment BlockTeaser on BlockTeaser {
        __typename
        image {
          id: _id
        }
        title
        subtitle
        # TODO: Uncomment once Gutenberg uses UUIDs for linking content.
        #url
      }

      {
        complete: _loadGutenbergPage(
          id: "f9778402-1375-4bc0-a550-00610ad3865d"
        ) {
          ...GutenbergPage
        }
        minimal: _loadGutenbergPage(
          id: "af2bb5e4-237a-4e76-befe-e7a3d8dc699c"
        ) {
          ...GutenbergPage
        }
      }
    `);

    (
      Object.values(result.data) as Array<{
        path: string;
        body: Array<{ html: string } | {}>;
      }>
    ).forEach((page) => {
      page.path = page.path.replace(/\d+/, '[numeric]');
      page.body.forEach((block) => {
        if ('html' in block) {
          block.html = block.html.replace(
            /data-id="\d+"/,
            'data-id="[numeric]"',
          );
        }
      });
    });

    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "complete": {
            "__typename": "GutenbergPage",
            "body": [
              {
                "__typename": "BlockHtmlParagraph",
                "html": "
      <p>A paragraph with a <a href="/en/article/with-everything" data-type="[EN] article" data-id="[numeric]">link</a>.</p>
      ",
              },
              {
                "__typename": "BlockHtmlList",
                "html": "
      <ul><li>unordered</li><li>list</li></ul>
      ",
              },
              {
                "__typename": "BlockHtmlList",
                "html": "
      <ol><li>ordered</li><li>list</li></ol>
      ",
              },
              {
                "__typename": "BlockHtmlQuote",
                "html": "
      <blockquote class="wp-block-quote"><p>A quote</p><cite>With a citation.</cite></blockquote>
      ",
              },
              {
                "__typename": "BlockHtmlParagraph",
                "html": "
      <p>Grouped paragraph 1.</p>

      <p>Grouped paragraph 2.</p>
      ",
              },
              {
                "__typename": "BlockTwoColumns",
                "children": [
                  {
                    "__typename": "BlockColumn",
                    "children": [
                      {
                        "__typename": "BlockTeaser",
                        "image": {
                          "id": "378fdfc0-05fa-4d50-aaed-3342cd5f844c:en",
                        },
                        "subtitle": "on left",
                        "title": "Teaser",
                      },
                    ],
                  },
                  {
                    "__typename": "BlockColumn",
                    "children": [
                      {
                        "__typename": "BlockImage",
                        "caption": "Just media on right",
                        "image": {
                          "id": "fd3a7238-807a-483d-a703-c9b1b6b4a8e8:en",
                        },
                      },
                      {
                        "__typename": "BlockHtmlParagraph",
                        "html": "
      <p></p>
      ",
                      },
                    ],
                  },
                ],
              },
            ],
            "defaultTranslation": true,
            "drupalId": "f9778402-1375-4bc0-a550-00610ad3865d",
            "id": "f9778402-1375-4bc0-a550-00610ad3865d:en",
            "langcode": "en",
            "path": "/en/node/[numeric]",
            "title": "Gutenberg page",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
            ],
          },
          "minimal": {
            "__typename": "GutenbergPage",
            "body": [
              {
                "__typename": "BlockHtmlParagraph",
                "html": "
      <p></p>
      ",
              },
            ],
            "defaultTranslation": true,
            "drupalId": "af2bb5e4-237a-4e76-befe-e7a3d8dc699c",
            "id": "af2bb5e4-237a-4e76-befe-e7a3d8dc699c:en",
            "langcode": "en",
            "path": "/en/node/[numeric]",
            "title": "Empty Gutenberg page",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
            ],
          },
        },
      }
    `);
  });

  test('Image', async () => {
    const result = await fetch(gql`
      fragment Image on Image {
        __typename
        id: _id
        drupalId: _drupalId
        langcode: _langcode
        defaultTranslation: _defaultTranslation
        translations: _translations {
          langcode: _langcode
          defaultTranslation: _defaultTranslation
        }
        url
        alt
      }

      {
        loadImage: _loadImage(id: "fd3a7238-807a-483d-a703-c9b1b6b4a8e8") {
          ...Image
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "loadImage": {
            "__typename": "Image",
            "alt": "Kitten alt text",
            "defaultTranslation": true,
            "drupalId": "fd3a7238-807a-483d-a703-c9b1b6b4a8e8",
            "id": "fd3a7238-807a-483d-a703-c9b1b6b4a8e8:en",
            "langcode": "en",
            "translations": [
              {
                "defaultTranslation": true,
                "langcode": "en",
              },
              {
                "defaultTranslation": false,
                "langcode": "de",
              },
            ],
            "url": "http://127.0.0.1:8888/sites/default/files/2021-01/image_jpg_kitten.jpg",
          },
        },
      }
    `);
  });

  test('MenuItem', async () => {
    const result = await fetch(gql`
      fragment MenuItem on MenuItem {
        __typename
        id
        url
        label
        parent
      }
      {
        queryMainMenus: _queryMainMenus(offset: 0, limit: 100) {
          translations: _translations {
            langcode: _langcode
            items {
              ...MenuItem
            }
          }
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "queryMainMenus": [
            {
              "translations": [
                {
                  "items": [
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:6fba1578-67b4-415f-95ad-484fc39cb0ea",
                      "label": "Sub-sub item",
                      "parent": "menu_link_content:fb5806a5-e3c9-4288-b24a-4e9479cdc691",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:8c0b0fa6-c1ef-462d-8e6e-0de18b6ca17a",
                      "label": "Sub-Item 1",
                      "parent": "menu_link_content:9cdfa685-ec5a-4fe9-8395-5abfb024e9a3",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:fb5806a5-e3c9-4288-b24a-4e9479cdc691",
                      "label": "Sub-Item 2",
                      "parent": "menu_link_content:9cdfa685-ec5a-4fe9-8395-5abfb024e9a3",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:b9e46083-ddab-4d3d-8aee-b92029e473a0",
                      "label": "English",
                      "parent": "",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:c5b3b5b8-22e1-4cb3-a1e2-59d0a8f054a3",
                      "label": "German",
                      "parent": "",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:9cdfa685-ec5a-4fe9-8395-5abfb024e9a3",
                      "label": "Parent item",
                      "parent": "",
                      "url": "/en",
                    },
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:a64465a1-beb3-4b5e-86c5-3956de6dbdf2",
                      "label": "Translated (English)",
                      "parent": "",
                      "url": "/en",
                    },
                  ],
                  "langcode": "en",
                },
                {
                  "items": [
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:a64465a1-beb3-4b5e-86c5-3956de6dbdf2",
                      "label": "Translated (German)",
                      "parent": "",
                      "url": "/de",
                    },
                  ],
                  "langcode": "de",
                },
                {
                  "items": [
                    {
                      "__typename": "MenuItem",
                      "id": "menu_link_content:a64465a1-beb3-4b5e-86c5-3956de6dbdf2",
                      "label": "Translated (French)",
                      "parent": "",
                      "url": "/fr",
                    },
                  ],
                  "langcode": "fr",
                },
              ],
            },
          ],
        },
      }
    `);
  });

  test('Webform', async () => {
    const result = await fetch(gql`
      fragment Webform on Webform {
        __typename
        id: _id
        drupalId: _drupalId
        url
        title
        path
      }
      {
        loadWebform: _loadWebform(id: "452a69f0-cade-443f-8ba6-46b5fe92cedd") {
          ...Webform
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "loadWebform": {
            "__typename": "Webform",
            "drupalId": "452a69f0-cade-443f-8ba6-46b5fe92cedd",
            "id": "452a69f0-cade-443f-8ba6-46b5fe92cedd",
            "path": "/en/form/for-testing-confirmation-options",
            "title": "For testing confirmation options",
            "url": "http://127.0.0.1:8888/en/form/for-testing-confirmation-options",
          },
        },
      }
    `);
  });
});
