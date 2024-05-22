import { Effect } from 'effect';

import { Git } from '../services/git.js';
import { Storage } from '../services/storage.js';
import { analyzeProject } from './analyze.js';
import { score } from './score.js';

export const update = Effect.gen(function* () {
  const git = yield* Git;
  const latestCommit = (yield* git.log).latest!;
  const hash = latestCommit.hash;
  const currentScore = yield* score(yield* analyzeProject);
  const storage = yield* Storage;
  yield* storage.update(hash, new Date(latestCommit.date), currentScore);
});
