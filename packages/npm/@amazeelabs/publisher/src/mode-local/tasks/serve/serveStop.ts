import { TaskJob } from '../../../tools/queue';
import { core } from '../../core';

export const serveStopTask: TaskJob = async () => {
  await core.serveProcess?.kill();
  return true;
};
