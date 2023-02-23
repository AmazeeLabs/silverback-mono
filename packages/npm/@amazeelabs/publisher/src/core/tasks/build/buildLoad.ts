import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';

export const buildLoadTask: TaskJob = async () => {
  if (!getConfig().persistentBuilds) {
    return true;
  }
  core.output$.next('Loading the build', 'info');
  // AXXX build load
  // AXXX respect cancel
  return true;
};
