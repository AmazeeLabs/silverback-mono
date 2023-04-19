import fs from 'fs-extra';
import path from 'path';

import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';

export const buildSaveTask: TaskJob = async (controller) => {
  const config = getConfig().persistentBuilds;
  if (!config) {
    return true;
  }
  core.output$.next('Saving the build\n', 'info');

  let saved = false;

  controller.onCancel(() => {
    // We specifically ignore cancelling here to avoid broken saved builds.
  });

  const { buildPaths, saveTo } = config;
  const destination = path.resolve(saveTo);
  try {
    fs.removeSync(destination);
  } catch (e) {
    core.output$.next(`Failed to remove ${destination}`, 'error');
    return false;
  }
  for (const buildPath of buildPaths) {
    const dirName = path.basename(buildPath);
    const source = path.resolve(buildPath);
    if (!fs.existsSync(source)) {
      continue;
    }
    const target = path.resolve(saveTo, dirName);
    try {
      await fs.copy(source, target, {
        overwrite: true,
      });
    } catch (e) {
      core.output$.next(`Failed to copy ${source} to ${target}`, 'error');
      return false;
    }
    saved = true;
  }

  if (saved) {
    core.output$.next('Build saved\n', 'info');
  } else {
    core.output$.next('No build found\n', 'warning');
  }
  return true;
};
