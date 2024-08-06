import { getConfigLocal } from '../../../tools/config';
import { TaskJob } from '../../../tools/queue';
import { core } from '../../core';
import { run } from '../../tools/runner';

export const buildDeployTask: TaskJob = async (controller) => {
  core.state.setDeployJobState('InProgress');

  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const attempts = 3;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    const command = getConfigLocal().commands.deploy;
    if (!command) {
      // If command isn't set, consider the deploy task successful.
      core.state.setDeployJobState('Success');
      return true;
    }
    const process = run({ command, controller });
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
