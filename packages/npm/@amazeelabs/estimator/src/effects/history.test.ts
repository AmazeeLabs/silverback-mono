import * as fs from 'node:fs';

import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

import { deserialize } from '../services/storage.js';
import { writeHistory } from './history.js';

function readStorage(file: string) {
  expect(fs.existsSync(file)).toBe(true);
  // Strip away the "null" entry.
  return fs
    .readFileSync(file)
    .toString()
    .split('\n')
    .map(deserialize)
    .map(({ score, secondsSpent }) => ({ score, secondsSpent }));
}

describe('writeHistory', () => {
  it('throws on an empty repository', async ({ effectError }) => {
    const result = await effectError(
      Effect.gen(function* () {
        yield* writeHistory;
      }),
    );
    expect(result).toMatch(/does not have any commits yet/);
  });

  it('writes scores for all relevant commits', async ({
    repo,
    effectValue,
  }) => {
    await repo.write(
      '.estimatorrc.yml',
      'documents: ["src/*.graphql"]\nstorage: "estimator.txt"',
    );
    await repo.write('src/schema.graphql', 'type Query { hello: String }');
    await repo.commit('Initial commit');
    await repo.write(
      'src/schema.graphql',
      'type Query { hello: String }\ntype Foo { bar: String }',
    );
    await repo.commit('Second commit');
    await effectValue(
      Effect.gen(function* () {
        yield* writeHistory;
      }),
    );

    expect(fs.existsSync(repo.directory + '/estimator.txt')).toBe(true);
    const data = readStorage(repo.directory + '/estimator.txt');
    expect(data).toMatchInlineSnapshot(`
      [
        {
          "score": 10,
          "secondsSpent": 600,
        },
        {
          "score": 20,
          "secondsSpent": 1200,
        },
      ]
    `);
  });

  it('does not write scores for irrelevant commits', async ({
    repo,
    effectValue,
  }) => {
    await repo.write(
      '.estimatorrc.yml',
      'documents: ["src/*.graphql"]\nstorage: "estimator.txt"',
    );
    await repo.write('src/schema.graphql', 'type Query { hello: String }');
    // Relevant commit #1
    await repo.commit('Relevant commit #1');

    // Irrelevant commit
    await repo.write('REAME.md', 'RTFM!');
    await repo.commit('Irrelevant commit');

    await repo.write(
      'src/schema.graphql',
      'type Query { hello: String }\ntype Foo { bar: String }',
    );
    await repo.commit('Third commit');

    await repo.write('REAME.md', 'RTFM! Again!');
    await repo.commit('Fourth commit');

    await effectValue(
      Effect.gen(function* () {
        yield* writeHistory;
      }),
    );

    expect(fs.existsSync(repo.directory + '/estimator.txt')).toBe(true);
    const data = readStorage(repo.directory + '/estimator.txt');
    expect('foo').toMatchInlineSnapshot(`"foo"`);
    expect(data).toMatchInlineSnapshot(`
        [
          {
            "score": 10,
            "secondsSpent": 600,
          },
          {
            "score": 20,
            "secondsSpent": 1200,
          },
        ]
      `);
  });
});
