import stripAnsi from 'strip-ansi';
import { $ } from 'zx';

import { core } from '../core';
import { OutputSubject } from './output';
import { TaskController } from './queue';

$.quote = (s): string => s;
$.verbose = false;
$.env.CI = 'true';

type Result = {
  exitCode: number | null;
};

export type Process = {
  output: OutputSubject;
  result: Promise<Result>;
  kill: () => Promise<void>;
};

export const run = (options: {
  command: string;
  controller: TaskController;
  outputTimeout?: number;
}): Process => {
  core.output$.next(`Starting command: "${options.command}"`, 'info');
  const process = $`( ${options.command} ) 2>&1`.nothrow();

  let outputTimeout: NodeJS.Timeout | undefined;
  const setOutputTimeout = (stop = false): void => {
    clearTimeout(outputTimeout);
    if (stop) {
      return;
    }
    const timeout = options.outputTimeout;
    if (!timeout) {
      return;
    }
    outputTimeout = setTimeout(() => {
      core.output$.next(
        `Killing command due to the output timeout (${timeout}ms): "${options.command}"`,
        'warning',
      );
      kill();
    }, timeout);
  };

  setOutputTimeout();
  const output = new OutputSubject();
  process.stdout.addListener('data', (chunk) => {
    setOutputTimeout();
    const string = stripAnsi(`${chunk}`);
    if (['\n', ''].includes(string.trim())) {
      return;
    }
    output.next(string);
    core.output$.next(string);
  });

  const result = new Promise<Result>((resolve) =>
    process
      .then((result) => {
        if (result.exitCode === 0) {
          core.output$.next(`Command exited: "${options.command}"`, 'success');
        } else {
          core.output$.next(
            `Command exited with ${result.exitCode}: "${options.command}"`,
            'error',
          );
        }
        setOutputTimeout(true);
        resolve({ exitCode: result.exitCode });
      })
      .catch(() => {
        core.output$.next(`Command errored: "${options.command}"`, 'error');
        setOutputTimeout(true);
        resolve({ exitCode: null });
      }),
  );

  const kill = async (): Promise<void> => {
    core.output$.next(`Killing command: "${options.command}"`, 'info');
    const signals = ['SIGINT', 'SIGTERM', 'SIGKILL'];
    while (signals.length) {
      const signal = signals.shift();
      // process.kill() returns a promise, but when it is resolved, the process
      // is not necessarily killed yet ...
      await process.kill(signal);
      const firstResolved = await Promise.any([
        // ... so we wait for the process result.
        result.then(() => 'killed'),
        new Promise((resolve) => setTimeout(resolve, 1000)).then(
          () => 'timeout',
        ),
      ]);
      if (firstResolved === 'killed') {
        return;
      }
    }
    throw new Error(`Failed to kill "${options.command}" process.`);
  };

  options.controller?.onCancel(() => kill());

  return {
    output,
    result,
    kill,
  };
};
