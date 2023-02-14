import { fs, path } from 'zx';

import { core } from '../../core';
import { getConfig } from '../../tools/config';
import { TaskJob } from '../../tools/queue';

export const buildLoadTask: TaskJob = async (controller) => {
  const config = getConfig().persistentBuilds;
  if (!config) {
    return true;
  }
  core.output$.next('Loading the build', 'info');

  let loaded = false;

  let cancelled = false;
  controller.onCancel(() => {
    cancelled = true;
  });

  const { buildPaths, saveTo } = config;
  for (const buildPath of buildPaths) {
    const dirName = path.basename(buildPath);
    const target = path.resolve(buildPath);
    try {
      await fs.remove(target);
    } catch (e) {
      core.output$.next(`Failed to remove ${target}`, 'error');
      return false;
    }
    if (cancelled) {
      return false;
    }
    const source = path.resolve(saveTo, dirName);
    if (!fs.existsSync(source)) {
      continue;
    }
    try {
      await fs.copy(source, target, {
        recursive: true,
        overwrite: true,
      });
    } catch (e) {
      core.output$.next(`Failed to copy ${source} to ${target}`, 'error');
      return false;
    }
    if (cancelled) {
      return false;
    }
    loaded = true;
  }

  if (loaded) {
    core.output$.next('Build loaded\n', 'info');
  } else {
    core.output$.next('No saved build found\n', 'warning');
  }
  return true;
};
