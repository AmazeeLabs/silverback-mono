import { execSync } from 'child_process';
import gql from 'noop-tag';
import { resolve } from 'path';
import { afterEach, expect, test } from 'vitest';

import { fetch } from '../lib.js';

afterEach(() => {
  execSync(
    'pnpm run --filter "@-amazeelabs/silverback-drupal" snapshot-restore',
  );
});

test('views cache', async () => {
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

  const scriptDelete = resolve(__dirname, 'views-cache-delete.php');
  execSync(
    `pnpm run --filter "@-amazeelabs/silverback-drupal" drush scr ${scriptDelete}`,
  );
  const result1 = await fetch(gql`
    {
      contentHub(locale: "en") {
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

  const scriptCreate = resolve(__dirname, 'views-cache-create.php');
  execSync(
    `pnpm run --filter "@-amazeelabs/silverback-drupal" drush scr ${scriptCreate}`,
  );
  const result2 = await fetch(gql`
    {
      contentHub(locale: "en") {
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
              "title": "New news",
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
