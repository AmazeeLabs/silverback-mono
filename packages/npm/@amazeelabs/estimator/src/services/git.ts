import { Context, Effect } from 'effect';
import { DiffResult, GitError, LogResult, simpleGit } from 'simple-git';

import { configuration } from '../effects/configuration.js';

interface IGit {
  log: Effect.Effect<LogResult, GitError>;
  diff: (from: string, to: string) => Effect.Effect<DiffResult, GitError>;
  checkout: (hash: string) => Effect.Effect<void, GitError>;
}

export const makeGit = Effect.gen(function* () {
  const dir = (yield* configuration).root;
  return {
    log: Effect.async<LogResult, GitError>((resume) => {
      simpleGit(dir).log(undefined, (err, log) => {
        if (err) {
          resume(Effect.fail(err));
        }
        resume(Effect.succeed(log));
      });
    }),
    diff: (from: string, to: string) =>
      Effect.async<DiffResult, GitError>((resume) => {
        simpleGit(dir).diffSummary(`${from}...${to}`, (err, log) => {
          if (err) {
            resume(Effect.fail(err));
          }
          resume(Effect.succeed(log));
        });
      }),
    checkout: (hash: string) =>
      Effect.async<void, GitError>((resume) => {
        simpleGit(dir).checkout(hash, (err) => {
          if (err) {
            resume(Effect.fail(err));
          }
          resume(Effect.succeed(undefined));
        });
      }),
  } satisfies IGit;
});

export class Git extends Context.Tag('Git')<Git, IGit>() {}
