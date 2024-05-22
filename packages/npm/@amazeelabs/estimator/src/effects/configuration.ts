import { Path } from '@effect/platform';
import { Data, Effect } from 'effect';
import { output, z } from 'zod';

import { configSchema } from '../configschema.js';
import { ConfigFile } from '../services/configfile.js';

const errorMap: z.ZodErrorMap = (issue, ctx) => {
  return {
    message: `Config error at "${issue.path.join('.')}": ${ctx.defaultError}`,
  };
};

class ConfigurationError extends Data.TaggedError('ConfigurationError')<{
  errors: Array<string>;
}> {
  toString(): string {
    return ['Configuration errors:', ...this.errors].join('\n');
  }
}

/**
 * Search for a configuration file from the current directory.
 */
export const configuration = Effect.gen(function* () {
  const file = yield* ConfigFile;
  const path = yield* Path.Path;
  const data = yield* file.content;

  const parsedConfig = configSchema.safeParse(data.config || {}, {
    errorMap,
  });
  if (!parsedConfig.success) {
    yield* new ConfigurationError({
      errors: parsedConfig.error.errors.map((issue) => issue.message),
    });
  }
  return {
    ...parsedConfig.data,
    root: path.dirname(data!.filepath),
  } as output<typeof configSchema> & { root: string };
});
