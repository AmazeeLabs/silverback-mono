import { Effect } from 'effect';
import { expect, test } from 'vitest';

import { Storage } from '../services/storage.js';
import { update } from './update.js';

test('throws on an empty repository', async ({ effectError, repo }) => {
  await repo.write('.estimatorrc.yml', 'documents: ["*.graphql"]');
  await repo.write('schema.graphql', 'type Query { hello: String }');
  await effectError(update);
});

test('updates the storage', async ({ effectValue, repo }) => {
  await repo.write(
    '.estimatorrc.yml',
    'storage: "estimator.txt"\ndocuments: ["*.graphql"]',
  );
  await repo.write('schema.graphql', 'type Query { hello: String }');
  await repo.commit('Initial commit');
  await effectValue(update);

  const firstResult = await effectValue(
    Effect.gen(function* () {
      return yield* (yield* Storage).status;
    }),
  );
  expect(firstResult).toEqual({ score: 10, secondsSpent: 600 });
  await repo.write(
    'schema.graphql',
    'type Query { hello: String }\ntype Foo { bar: String }',
  );
  await repo.commit('Second commit');
  await effectValue(update);
  const secondResult = await effectValue(
    Effect.gen(function* () {
      return yield* (yield* Storage).status;
    }),
  );
  expect(secondResult).toEqual({ score: 20, secondsSpent: 1200 });
});
