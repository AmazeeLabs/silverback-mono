import { spawn } from 'child_process';
import { kill } from 'cross-port-killer';
import fs from 'fs';
import { check, waitUntilUsed } from 'tcp-port-used';
import { $, nothrow, ProcessOutput, ProcessPromise, sleep } from 'zx';

import { EnvVars } from './types';

export const port = {
  killIfUsed: async (port: number | Array<number>) => {
    const ports = typeof port === 'number' ? [port] : port;
    let wait = false;
    for (const current of ports) {
      if (await check(current)) {
        await kill(current);
        wait = true;
      }
    }
    if (wait) {
      // Somehow the port isn't yet available if we try to use it immediately.
      await sleep(1000);
    }
  },
  waitUntilUsed,
  check,
};

export const log = (message: string) => {
  if (process.env.SP_VERBOSE) {
    console.log(`SP_DEBUG: ${message}`);
  }
};

export const runDetached = async ({
  workDir,
  command,
  logFile,
  waitForOutput,
}: {
  workDir: string;
  command: string;
  logFile: string;
  waitForOutput?: string;
}): Promise<void> => {
  log(`executing detached "${command}"`);
  await $`echo "" > ${logFile}`;
  const out = fs.openSync(logFile, 'a');
  spawn(command, {
    detached: true,
    stdio: ['ignore', out, out],
    env: process.env,
    cwd: workDir,
    shell: true,
  });
  if (waitForOutput) {
    const tail = nothrow($`tail -f ${logFile}`);
    return new Promise<void>((resolve) => {
      const event = 'data';
      const listener = (chunk: any) => {
        const string: string = chunk.toString();
        if (string.includes(waitForOutput)) {
          tail.kill();
          resolve();
        }
      };
      tail.stdout.addListener(event, listener);
    });
  }
};

export const getEnvVars = (): EnvVars =>
  ({
    SP_TEST_DIR: process.env.SP_TEST_DIR, // both
    SP_TEST_TYPE: process.env.SP_TEST_TYPE, // both
    SP_VERBOSE: process.env.SP_VERBOSE, //
    SP_TRACE: process.env.SP_TRACE,
  } as EnvVars);

export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(`Unreachable case: ${JSON.stringify(val)}`);
  }
}
