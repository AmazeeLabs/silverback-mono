import { kill } from 'cross-port-killer';
import { check, waitUntilUsed } from 'tcp-port-used';
import { sleep } from 'zx';

export const port = {
  killIfUsed: async (port: number) => {
    if (await check(port)) {
      await kill(port);
      // Somehow the port isn't yet available if we try to use it immediately.
      await sleep(1000);
    }
  },
  waitUntilUsed,
};
