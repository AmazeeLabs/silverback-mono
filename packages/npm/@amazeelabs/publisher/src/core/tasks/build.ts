import { core } from '../core';
import { saveBuildInfo } from '../tools/database';
import { Queue, TaskJob } from '../tools/queue';
import { buildDeployTask } from './build/buildDeploy';
import { buildRunTask } from './build/buildRun';
import { serveStartTask } from './serve/serveStart';

export const buildTask: (options?: { skipInitialBuild?: boolean }) => TaskJob =
  (options) => (controller) => {
    core.state.incrementBuildNumber();
    core.state.setBuildState('InProgress');

    const startedAt = Date.now();
    const output: Array<string> = [];
    const outputSubscription = core.output$.subscribe((chunk) => {
      output.push(
        `${new Date()
          .toISOString()
          .substring(0, 19)
          .replace('T', ' ')} ${chunk}`,
      );
    });
    const saveBuildLogs = (): void => {
      saveBuildInfo({
        type: core.state.getBuildNumber() === 1 ? 'full' : 'incremental',
        startedAt,
        finishedAt: Date.now(),
        success:
          core.state.getBuildJobState() === 'Success' &&
          core.state.getDeployJobState() === 'Success',
        logs: output.join(''),
      });
      outputSubscription.unsubscribe();
    };

    return new Promise((resolve) => {
      const queue = new Queue();

      controller.onCancel(async () => {
        await queue.clear();
        core.state.setBuildState('Done');
        saveBuildLogs();
        resolve(false);
      });

      if (!options?.skipInitialBuild) {
        queue.add({
          job: buildRunTask,
          options: { shouldStopQueueOnFailure: true },
        });
      }

      queue.add({ job: serveStartTask });

      if (!options?.skipInitialBuild) {
        queue.add({ job: buildDeployTask });
      }

      queue.run();
      queue.whenIdle.then(() => {
        core.state.setBuildState('Done');
        saveBuildLogs();
        resolve(true);
      });
    });
  };
