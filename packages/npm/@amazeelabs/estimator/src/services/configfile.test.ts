import { Effect } from 'effect';
import { expect, test } from 'vitest';

import { ConfigFile } from './configfile.js';

test('none', async ({ effectValue, repo }) => {
  const result = await effectValue(
    Effect.gen(function* () {
      return yield* (yield* ConfigFile).content;
    }),
  );
  expect(result.config).toEqual({});
  expect(result.filepath).toEqual(`${repo.directory}/.estimatorrc.yml`);
});

test('yaml', async ({ repo, effectValue }) => {
  await repo.write('.estimatorrc.yml', 'documents: ["src/**/*.gql"]');
  const result = await effectValue(
    Effect.gen(function* () {
      return yield* (yield* ConfigFile).content;
    }),
  );
  expect(result.config.documents).toEqual(['src/**/*.gql']);
  expect(result.filepath).toEqual(`${repo.directory}/.estimatorrc.yml`);
});

test('typescript', async ({ repo, effectValue }) => {
  await repo.write(
    'estimator.config.ts',
    'export default { documents: ["src/**/*.gql"]};',
  );
  const result = await effectValue(
    Effect.gen(function* () {
      return yield* (yield* ConfigFile).content;
    }),
  );
  expect(result.config).toEqual({ documents: ['src/**/*.gql'] });
  expect(result.filepath).toEqual(`${repo.directory}/estimator.config.ts`);
});

test('broken', async ({ repo, effectError }) => {
  await repo.write(
    'estimator.config.ts',
    'export default { documents: ["src/**/*.gql',
  );
  const result = await effectError(
    Effect.gen(function* () {
      return yield* (yield* ConfigFile).content;
    }),
  );
  expect(result).toContain(
    `ConfigFileError: "Invalid or unexpected token" in "${repo.directory}/estimator.config.ts"`,
  );
});
