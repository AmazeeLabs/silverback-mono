import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';
import { run } from '../../tools/runner';
import { cleanRunTask } from '../clean/cleanRun';

export const buildRunTask: TaskJob = async (controller) => {
  core.state.setBuildJobState('InProgress');

  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    if (attempt === 2 && core.state.getBuildNumber() === 1) {
      // Try to clean if the first build failed.
      await cleanRunTask(controller);
      if (cancelled) {
        core.state.setBuildJobState('Error');
        return false;
      }
    }
    const process = run({
      command: getConfig().commands.build,
      controller,
    });
    const { exitCode } = await process.result;
    if (cancelled) {
      core.state.setBuildJobState('Error');
      return false;
    }
    if (exitCode === 0) {
      core.state.setBuildJobState('Success');
      return true;
    }
  }

  core.state.setBuildJobState('Error');
  return false;
};
