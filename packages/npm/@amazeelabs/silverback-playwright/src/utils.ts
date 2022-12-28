import { format } from '@redtea/format-axios-error';
import { kill } from 'cross-port-killer';
import { check, waitUntilUsedOnHost } from 'tcp-port-used';
import { sleep } from 'zx';

import { EnvVars } from './types';

export const port = {
  killIfUsed: async (port: number | Array<number>) => {
    const ports = typeof port === 'number' ? [port] : port;
    let wait = false;
    for (const current of ports) {
      if (await check(current, 'localhost')) {
        await kill(current);
        wait = true;
      }
    }
    if (wait) {
      // Somehow the port isn't yet available if we try to use it immediately.
      await sleep(1000);
    }
  },
  waitUntilUsed: (port: number, retryTimeMs?: number, timeOutMs?: number) => {
    return waitUntilUsedOnHost(port, 'localhost', retryTimeMs, timeOutMs);
  },
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

export const axiosErrorHandler = (e: any) => {
  console.error(
    `"${e.message}" error details: ${JSON.stringify(format(e), null, 2)}`,
  );
  throw e;
};
