import { getConfigLocal } from '../../../tools/config';
import { TaskJob } from '../../../tools/queue';
import { core } from '../../core';
import { run } from '../../tools/runner';

export const cleanRunTask: TaskJob = async (controller) => {
  core.state.setCleanState('InProgress');
  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const process = run({ command: getConfigLocal().commands.clean, controller });
  const { exitCode } = await process.result;
  const success = !cancelled && exitCode === 0;
  core.state.setCleanState(success ? 'Success' : 'Error');
  return success;
};
