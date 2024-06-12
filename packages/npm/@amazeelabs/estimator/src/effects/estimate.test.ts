import { expect, test } from 'vitest';

import { estimate } from './estimate.js';
import { writeHistory } from './history.js';

test('throws if the parent commit does not exist', async ({ effectError }) => {
  const error = await effectError(estimate, {
    PARENT_COMMIT: 'non-existent-commit',
  });
  expect(error).toContain(
    `pathspec 'non-existent-commit' did not match any file(s) known to git`,
  );
});

test('returns the diff and velocity', async ({ effectValue, repo }) => {
  await repo.write('.estimatorrc.yml', 'documents: ["*.graphql"]');
  await repo.write('schema.graphql', 'type Query { hello: String }');
  const commit = await repo.commit('Initial commit');
  await effectValue(writeHistory);
  await repo.write(
    'schema.graphql',
    'type Query { hello: String! }\ntype Foo { bar: String }',
  );
  await repo.commit('Second commit');
  const result = await effectValue(estimate, { PARENT_COMMIT: commit.commit });
  expect(result).toEqual({
    diff: 8,
    secondsPerPoint: 60,
  });
});

test('works if the parent commit does not contain the config', async ({
  repo,
  effectValue,
}) => {
  await repo.write('schema.graphql', 'type Query { hello: String }');
  const commit = await repo.commit('Initial commit');
  // Config is added "after" the parent commit.
  await repo.write('.estimatorrc.yml', 'documents: ["*.graphql"]');
  await repo.write(
    'schema.graphql',
    'type Query { hello: String! }\ntype Foo { bar: String }',
  );
  await repo.commit('Second commit');
  await effectValue(writeHistory);
  const result = await effectValue(estimate, { PARENT_COMMIT: commit.commit });
  expect(result).toEqual({
    diff: 8,
    secondsPerPoint: 60,
  });
});
