import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';
import { run } from '../../tools/runner';

export const buildDeployTask: TaskJob = async (controller) => {
  core.state.setDeployJobState('InProgress');

  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const process = run({ command: getConfig().commands.deploy, controller });
    const { exitCode } = await process.result;
    if (cancelled) {
      core.state.setDeployJobState('Error');
      return false;
    }
    if (exitCode === 0) {
      core.state.setDeployJobState('Success');
      return true;
    }
  }

  core.state.setDeployJobState('Error');
  return false;
};
