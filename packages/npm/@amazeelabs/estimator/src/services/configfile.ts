import { cosmiconfig, CosmiconfigResult } from 'cosmiconfig';
import { Cache, Context, Data, Duration, Effect } from 'effect';

class ConfigFileError extends Data.TaggedError('ConfigFileError')<{
  msg: string;
  filepath: string;
}> {
  toString(): string {
    return `ConfigFileError: "${this.msg}" in "${this.filepath}"`;
  }
}

interface IConfigFile {
  content: Effect.Effect<Exclude<CosmiconfigResult, null>, ConfigFileError>;
}

export class ConfigFile extends Context.Tag('ConfigFile')<
  ConfigFile,
  IConfigFile
>() {}

const loadConfigFile = (directory: string) =>
  Effect.tryPromise({
    try: async () => {
      const res = await cosmiconfig('estimator').search(directory);
      return (
        res || {
          filepath: `${directory}/.estimatorrc.yml`,
          config: {},
          isEmpty: true,
        }
      );
    },
    catch: (error: any) => {
      return new ConfigFileError({
        msg: error.message,
        filepath: error.filepath,
      });
    },
  });

export const makeConfigFile = (directory: string) =>
  Effect.gen(function* () {
    const cache = yield* Cache.make({
      timeToLive: Duration.infinity,
      lookup: loadConfigFile,
      capacity: 1,
    });
    return {
      content: Effect.gen(function* () {
        return yield* cache.get(directory);
      }),
    } satisfies IConfigFile;
  });
