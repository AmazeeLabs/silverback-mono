import tar from 'tar';
import simpleGit from 'simple-git';
import fs, { readJSONSync } from 'fs-extra';
import { Logger } from '@verdaccio/types';
import { processComposerPackage } from './composer';

type GitInfo = {
  version: string;
  config: {
    'git-publish': {
      url: string;
      branch: string;
    };
  };
};

export const isGitPackage = (info: {
  config?: { 'git-publish'?: { branch?: string; url?: string } };
}): info is GitInfo =>
  !!(
    info.config &&
    info.config['git-publish'] &&
    info.config['git-publish'].branch &&
    info.config['git-publish'].url
  );

export const pushToGit = async (name: string, path: string, logger: Logger) => {
  const archive = `${path}/${name}`;
  logger.debug(`[git] Extracting it to ${path}.`);
  tar.extract({
    sync: true,
    file: archive,
    cwd: path,
  });

  const info = readJSONSync(`${path}/package/package.json`);

  if (!isGitPackage(info)) {
    logger.warn(
      `[git] Skipping package ${name} because it has no remote repository config.`,
    );
    return;
  }

  if (isGitPackage(info)) {
    logger.debug(
      `[git] Cloning target repository ${info.config['git-publish'].url} to ${path}/clone.`,
    );
    const git = simpleGit();
    await git.clone(info.config['git-publish'].url, `${path}/clone`);
    fs.copySync(`${path}/clone/.git`, `${path}/package/.git`);

    processComposerPackage(`${path}/package`);

    logger.debug(
      `[git] Commiting version ${info.version} and pushing to ${info.config['git-publish'].url}#${info.config['git-publish'].branch}.`,
    );
    await git
      .cwd(`${path}/package`)
      .add(['./*'])
      .commit(`chore: release version ${info.version}`)
      .addTag(info.version)
      .push('origin')
      .pushTags('origin');
  }
};
