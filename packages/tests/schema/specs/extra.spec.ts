import gql from 'noop-tag';
import { expect, test } from 'vitest';

import { fetch } from '../lib.js';

test('extra', async () => {
  const result = await fetch(
    gql`
      {
        extraField
      }
    `,
    'extra',
  );
  expect(result).toMatchInlineSnapshot(`
    {
      "data": {
        "extraField": "Extra value",
      },
    }
  `);
});
