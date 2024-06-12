import { Effect } from 'effect';
import { expect, test } from 'vitest';

import { aggregate } from './aggregate.js';

test('empty', () => {
  expect(Effect.runSync(aggregate([]))).toEqual({});
});

test('different keys', () => {
  expect(
    Effect.runSync(
      aggregate([
        {
          a: 1,
          b: 2,
        },
      ]),
    ),
  ).toEqual({
    a: 1,
    b: 2,
  });
});

test('same keys', () => {
  expect(
    Effect.runSync(
      aggregate([
        {
          a: 1,
        },
        {
          a: 2,
        },
      ]),
    ),
  ).toEqual({
    a: 3,
  });
});
