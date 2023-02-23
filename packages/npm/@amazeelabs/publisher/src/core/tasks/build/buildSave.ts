import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';

export const buildSaveTask: TaskJob = async () => {
  if (!getConfig().persistentBuilds) {
    return true;
  }
  core.output$.next('Saving the build\n', 'info');
  // AXXX build save
  // AXXX ignore cancel
  return true;
};
