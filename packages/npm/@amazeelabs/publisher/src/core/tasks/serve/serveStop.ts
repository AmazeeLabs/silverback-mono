import { core } from '../../core';
import { TaskJob } from '../../tools/queue';

export const serveStopTask: TaskJob = async () => {
  await core.serveProcess?.kill();
  return true;
};
