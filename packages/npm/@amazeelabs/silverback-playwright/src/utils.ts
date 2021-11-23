import { kill } from 'cross-port-killer';
import { check, waitUntilUsed } from 'tcp-port-used';
import { sleep } from 'zx';

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
};

export const log = (message: string) => {
  if (process.env.SP_VERBOSE) {
    console.log(`SP_DEBUG: ${message}`);
  }
};

export const getEnvVars = (): EnvVars =>
  ({
    SP_TEST_DIR: process.env.SP_TEST_DIR,
    SP_TEST_TYPE: process.env.SP_TEST_TYPE,
    SP_VERBOSE: process.env.SP_VERBOSE,
    SP_TRACE: process.env.SP_TRACE,
  } as EnvVars);
