import { Effect } from 'effect';
import micromatch from 'micromatch';
import { DefaultLogFields, ListLogLine } from 'simple-git';

import { Git } from '../services/git.js';
import { Storage } from '../services/storage.js';
import { analyzeProject } from './analyze.js';
import { configuration } from './configuration.js';
import { score } from './score.js';

export const writeHistory = Effect.gen(function* () {
  const git = yield* Git;
  const log = Array.from((yield* git.log).all);
  log.sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  const config = yield* configuration;
  const storage = yield* Storage;

  let previous = undefined;
  const commits: Array<DefaultLogFields & ListLogLine> = [];
  for (const entry of log) {
    if (previous === undefined) {
      commits.push(entry);
    } else {
      const diff = yield* git.diff(previous.hash, entry.hash);
      const files = diff.files.map((file) => file.file);
      const matches = micromatch.match(files, config.documents);
      if (matches.length > 0) {
        commits.push(entry);
      }
    }
    previous = entry;
  }

  for (const commit of commits) {
    yield* git.checkout(commit.hash);
    const current = yield* score(yield* analyzeProject);
    yield* storage.update(commit.hash, new Date(commit.date), current);
  }
});
