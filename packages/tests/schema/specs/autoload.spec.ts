import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('Autoload', async () => {
  const result = await fetch(gql`
    query AutoloadTest {
      autoloadStatic
      autoloadService
    }
  `);
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "autoloadService": "container value",
        "autoloadStatic": "static value",
      },
    }
  `);
});
