import { expect, test } from 'vitest';

import { score } from './score.js';

const config = JSON.stringify({
  weights: {
    schema: {
      QUERY_FIELD_DEFINITION: 1,
      OBJECT_DEFINITION: 1,
    },
  },
});

test('empty', async ({ repo, effectValue }) => {
  await repo.write('.estimatorrc.json', config);
  const result = await effectValue(score({}));
  expect(result).toEqual(0);
});

test('should return the sum of the products of the counts and weights', async ({
  repo,
  effectValue,
}) => {
  await repo.write('.estimatorrc.json', config);
  const result = await effectValue(
    score({
      QUERY_FIELD_DEFINITION: 1,
      OBJECT_DEFINITION: 2,
    }),
  );
  expect(result).toEqual(3);
});
