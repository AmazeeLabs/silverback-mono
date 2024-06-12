import { Effect } from 'effect';
import glob from 'glob';

import { configuration } from './configuration.js';

/**
 * Scans for relevant files based on the configuration.
 */
export const scan = Effect.gen(function* () {
  const config = yield* configuration;
  const resolvedCwd = config.root;
  const globOpts = {
    absolute: true,
    cwd: resolvedCwd,
  } as Parameters<typeof glob>[1];

  let matches: string[] = [];

  for (const pattern of config.documents) {
    matches = matches.concat(
      yield* Effect.async<string[], Error>((resume) => {
        glob(pattern, globOpts, (err, matches) => {
          return err
            ? resume(Effect.fail(err))
            : resume(Effect.succeed(matches));
        });
      }),
    );
  }
  return matches;
});
