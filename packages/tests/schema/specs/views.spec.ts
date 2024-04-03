import gql from 'noop-tag';
import { describe, expect, test } from 'vitest';

import { fetch } from '../lib.js';

describe('views', () => {
  test('filters en', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "en") {
          filters {
            tag {
              value
              label
            }
          }
        }
      }
    `);
    (
      Object.values(result.data.contentHub.filters.tag) as Array<{
        value: string;
      }>
    ).forEach((item) => {
      item.value = '[numeric]';
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "filters": {
              "tag": [
                {
                  "label": "Tag 1",
                  "value": "[numeric]",
                },
                {
                  "label": "Tag 2",
                  "value": "[numeric]",
                },
              ],
            },
          },
        },
      }
    `);
  });

  test('filters de', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "de") {
          filters {
            tag {
              value
              label
            }
          }
        }
      }
    `);
    (
      Object.values(result.data.contentHub.filters.tag) as Array<{
        value: string;
      }>
    ).forEach((item) => {
      item.value = '[numeric]';
    });
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "filters": {
              "tag": [
                {
                  "label": "Tag 1 DE",
                  "value": "[numeric]",
                },
                {
                  "label": "Tag 2 DE",
                  "value": "[numeric]",
                },
              ],
            },
          },
        },
      }
    `);
  });

  test('with no args en', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "en") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated",
              },
              {
                "title": "News without tags",
              },
              {
                "title": "News with Tag 1 and Tag 2",
              },
              {
                "title": "News with Tag 1",
              },
            ],
            "total": 4,
          },
        },
      }
    `);
  });

  test('with no args de', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "de") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated DE",
              },
            ],
            "total": 1,
          },
        },
      }
    `);
  });

  test('filtered by title', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "en", args: "title=with") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News without tags",
              },
              {
                "title": "News with Tag 1 and Tag 2",
              },
              {
                "title": "News with Tag 1",
              },
            ],
            "total": 3,
          },
        },
      }
    `);

    const result2 = await fetch(gql`
      {
        contentHub(locale: "en", args: "title=translated") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result2).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated",
              },
            ],
            "total": 1,
          },
        },
      }
    `);
  });

  test('filtered by tags', async () => {
    const result = await fetch(gql`
      {
        contentHub(locale: "en") {
          filters {
            tag {
              value
              label
            }
          }
        }
      }
    `);
    const tags = result.data.contentHub.filters.tag as Array<{
      value: string;
      label: string;
    }>;
    const tag1Id = tags.find((tag) => tag.label === 'Tag 1')!.value;
    const tag2Id = tags.find((tag) => tag.label === 'Tag 2')!.value;

    const result1 = await fetch(gql`
      {
        contentHub(locale: "en", args: "tag[]=${tag1Id}") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result1).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated",
              },
              {
                "title": "News with Tag 1 and Tag 2",
              },
              {
                "title": "News with Tag 1",
              },
            ],
            "total": 3,
          },
        },
      }
    `);

    const result2 = await fetch(gql`
      {
        contentHub(locale: "en", args: "tag[]=${tag1Id}&tag[]=${tag2Id}") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result2).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated",
              },
              {
                "title": "News with Tag 1 and Tag 2",
              },
              {
                "title": "News with Tag 1",
              },
            ],
            "total": 3,
          },
        },
      }
    `);

    const result3 = await fetch(gql`
      {
        contentHub(locale: "en", args: "tag[]=${tag2Id}") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result3).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News with Tag 1 and Tag 2",
              },
            ],
            "total": 1,
          },
        },
      }
    `);
  });

  test('pagination', async () => {
    const result1 = await fetch(gql`
      {
        contentHub(locale: "en", args: "pageSize=2") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result1).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News translated",
              },
              {
                "title": "News without tags",
              },
            ],
            "total": 4,
          },
        },
      }
    `);

    const result2 = await fetch(gql`
      {
        contentHub(locale: "en", args: "pageSize=2&page=2") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result2).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [
              {
                "title": "News with Tag 1 and Tag 2",
              },
              {
                "title": "News with Tag 1",
              },
            ],
            "total": 4,
          },
        },
      }
    `);

    const result3 = await fetch(gql`
      {
        contentHub(locale: "en", args: "pageSize=2&page=3") {
          total
          rows {
            title
          }
        }
      }
    `);
    expect(result3).toMatchInlineSnapshot(`
      {
        "data": {
          "contentHub": {
            "rows": [],
            "total": 4,
          },
        },
      }
    `);
  });
});
