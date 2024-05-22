import { Effect } from 'effect';

import { configuration } from './configuration.js';

export const score = (amounts: Record<string, number>) =>
  Effect.gen(function* () {
    const config = yield* configuration;
    const weights: Record<string, number> = {
      ...config.weights.schema,
      ...config.weights.operations,
      ...config.weights.directives,
    };
    return Object.entries(amounts).reduce((acc, [key, amount]) => {
      return acc + (weights[key] || 0) * amount;
    }, 0);
  });
