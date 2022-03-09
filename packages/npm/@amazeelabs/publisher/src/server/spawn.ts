import { has, isObject } from 'lodash';
import { map } from 'rxjs';
import { spawn as originalSpawn } from 'rxjs-shell';

/**
 * Local version of "spawn" with a simpler command parameter.
 *
 * Also exists to be easily locally mockable with ShellMock.
 *
 * @param command The executable command.
 * @param payload A payload that will be serialized and sent to the process.
 */
export const spawn = (command: string, payload?: any) => {
  const [cmd, ...args] = command.split(' ');
  return originalSpawn(cmd, args, {
    env: {
      ...process.env,
      PUBLISHER_PAYLOAD: JSON.stringify(payload),
      CI: 'true',
    },
  }).pipe(
    map((output) => ({
      ...output,
      chunk: output.chunk.toString(),
    })),
  );
};

export type SpawnChunk = {
  type: 'stdout' | 'stderr';
  chunk: string;
};

export const isSpawnChunk = (value: any): value is SpawnChunk =>
  isObject(value) && has(value, 'chunk');
