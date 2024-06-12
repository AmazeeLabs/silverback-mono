import { Effect } from 'effect';
import { describe, expect, it } from 'vitest';

import { Repository } from '../helpers/repository.js';
import { Git } from './git.js';

describe('log', () => {
  it('throws on an empty repository', async ({ effectError }) => {
    const program = Effect.gen(function* () {
      const git = yield* Git;
      return yield* git.log;
    });
    const result = await effectError(program);
    expect(result).toMatch(/does not have any commits yet/);
  });

  it('returns a log on a repository with a commit', async ({
    repo,
    effectValue,
  }) => {
    await repo.write('file.txt', 'content');
    await repo.commit('Initial commit');
    const program = Effect.gen(function* () {
      const git = yield* Git;
      return yield* git.log;
    });
    const result = await effectValue(program);
    expect(result.total).toEqual(1);
  });

  it('ignores commits that are not on the current branch', async ({
    repo,
    effectValue,
  }) => {
    await repo.createBranch('main');
    await repo.write('a.txt', 'content');
    await repo.commit('a');
    await repo.write('b.txt', 'content');
    await repo.commit('b');
    await repo.createBranch('c');
    await repo.write('c.txt', 'content');
    await repo.commit('c');
    await repo.checkout('main');
    await repo.write('d.txt', 'content');
    await repo.commit('d');
    await repo.checkout('c');
    await repo.write('c.txt', 'content2');
    await repo.commit('c2');
    await repo.checkout('main');

    const program = Effect.gen(function* () {
      const git = yield* Git;
      return yield* git.log;
    });
    const result = await effectValue(program);
    expect(result.total).toEqual(3);
  });
});

describe('diff', async () => {
  async function setupRepo(repo: Repository) {
    await repo.write('a.txt', 'content');
    const a = await repo.commit('a');
    await repo.write('b.txt', 'content');
    const b = await repo.commit('b');
    await repo.write('c.txt', 'content');
    const c = await repo.commit('c');
    return [a, b, c];
  }

  it('throws on an empty repository', async ({ effectError }) => {
    const result = await effectError(
      Effect.gen(function* () {
        const git = yield* Git;
        return yield* git.diff('a', 'b');
      }),
    );
    expect(result).toMatch(/unknown revision or path/);
  });

  it('throws on unknown commits', async ({ repo, effectError }) => {
    await setupRepo(repo);
    const result = await effectError(
      Effect.gen(function* () {
        const git = yield* Git;
        return yield* git.diff('idont', 'exits');
      }),
    );
    expect(result).toMatch(/unknown revision or path/);
  });

  it('returns a diff between two commits', async ({ repo, effectValue }) => {
    const [a, b] = await setupRepo(repo);
    const result = await effectValue(
      Effect.gen(function* () {
        const git = yield* Git;
        return yield* git.diff(a.commit, b.commit);
      }),
    );
    expect(result.files.map((f) => f.file)).toEqual(['b.txt']);
  });

  it('returns a diff between multiple commits', async ({
    repo,
    effectValue,
  }) => {
    const [a, , c] = await setupRepo(repo);
    const result = await effectValue(
      Effect.gen(function* () {
        const git = yield* Git;
        return yield* git.diff(a.commit, c.commit);
      }),
    );
    expect(result.files.map((f) => f.file)).toEqual(['b.txt', 'c.txt']);
  });
});
