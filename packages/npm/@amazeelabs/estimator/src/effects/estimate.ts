import { Config, Effect } from 'effect';

import { Git } from '../services/git.js';
import { Storage } from '../services/storage.js';
import { analyzeProject } from './analyze.js';
import { score } from './score.js';

const velocity = Effect.gen(function* () {
  const { score, secondsSpent } = yield* (yield* Storage).status;
  return secondsSpent / score;
});

export const estimate = Effect.gen(function* () {
  const parent = yield* Config.string('PARENT_COMMIT');
  const git = yield* Git;
  const secondsPerPoint = yield* velocity;
  const currentScore = yield* score(yield* analyzeProject);
  yield* git.checkout(parent);
  const parentScore = yield* score(yield* analyzeProject);
  return { diff: currentScore - parentScore, secondsPerPoint };
});
