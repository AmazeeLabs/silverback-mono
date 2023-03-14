import { fs, path } from 'zx';

import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';
import { run } from '../../tools/runner';

export const cleanRunTask: TaskJob = async (controller) => {
  core.state.setCleanState('InProgress');
  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const config = getConfig().persistentBuilds;
  if (config) {
    core.output$.next('Removing saved builds', 'info');
    const savedBuildsPath = path.resolve(config.saveTo);
    try {
      fs.removeSync(savedBuildsPath);
    } catch (e) {
      core.output$.next(`Failed to remove ${savedBuildsPath}`, 'error');
      return false;
    }
    core.output$.next('Removed saved builds', 'info');
  }
  if (cancelled) {
    return false;
  }

  const process = run({ command: getConfig().commands.clean, controller });
  const { exitCode } = await process.result;
  const success = !cancelled && exitCode === 0;
  core.state.setCleanState(success ? 'Success' : 'Error');
  return success;
};
