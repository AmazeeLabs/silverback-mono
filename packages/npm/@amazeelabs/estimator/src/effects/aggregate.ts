import { Effect } from 'effect';

export const aggregate = (results: Iterable<Record<string, number>>) =>
  Effect.sync(() => {
    const result: Record<string, number> = {};
    for (const r of results) {
      for (const [key, value] of Object.entries(r)) {
        result[key] = result[key] ? result[key] + value : value;
      }
    }
    return result;
  });
