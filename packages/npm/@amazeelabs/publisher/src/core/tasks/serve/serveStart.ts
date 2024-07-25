import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';
import { run } from '../../tools/runner';

export const serveStartTask: TaskJob = async (controller) => {
  const serve = getConfig().commands.serve;
  if (!serve) {
    return true;
  }

  if (core.serveProcess) {
    return true;
  }

  const promise = new Promise<void>((resolve) => {
    const _serveProcess = run({
      command: serve.command,
      controller,
    });
    core.serveProcess = _serveProcess;
    _serveProcess.result
      .then(() => {
        core.serveProcess = null;
        return true;
      })
      .catch(() => {
        core.serveProcess = null;
        return true;
      });
    _serveProcess.output.subscribe((chunk) => {
      if (chunk.includes(serve.readyPattern)) {
        resolve();
      }
    });
  });

  const timeout = serve.readyTimeout;
  const result = timeout
    ? await Promise.any([
        promise,
        new Promise((resolve) => setTimeout(resolve, timeout)).then(
          () => 'timeout' as const,
        ),
      ])
    : await promise;
  if (result === 'timeout') {
    core.output$.next(
      `Could not find the serve ready pattern in ${timeout}ms\n`,
      'warning',
    );
    return false;
  }
  return true;
};
