import { core } from '../core';
import { saveBuildInfo } from '../tools/database';
import { Queue, TaskJob } from '../tools/queue';
import { buildDeployTask } from './build/buildDeploy';
import { buildLoadTask } from './build/buildLoad';
import { buildRunTask } from './build/buildRun';
import { buildSaveTask } from './build/buildSave';
import { serveStartTask } from './serve/serveStart';

export const buildTask: (options?: { skipInitialBuild?: boolean }) => TaskJob =
  (options) => (controller) => {
    core.state.incrementBuildNumber();
    core.state.setBuildState('InProgress');

    const startedAt = Date.now();
    const output: Array<string> = [];
    const outputSubscription = core.output$.subscribe((chunk) => {
      output.push(chunk);
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

      if (core.state.getBuildNumber() === 1) {
        queue.add({ job: buildLoadTask });
      }

      if (!options?.skipInitialBuild) {
        queue.add({
          job: buildRunTask,
          options: { shouldStopQueueOnFailure: true },
        });
      }

      queue.add({ job: serveStartTask });

      if (!options?.skipInitialBuild) {
        queue.add({ job: buildDeployTask });
        queue.add({ job: buildSaveTask });
      }

      queue.run();
      queue.whenIdle.then(() => {
        core.state.setBuildState('Done');
        saveBuildLogs();
        resolve(true);
      });
    });
  };
