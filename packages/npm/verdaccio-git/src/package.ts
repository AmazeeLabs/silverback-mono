import tar from 'tar';
import simpleGit from 'simple-git';
import fs, { readJSONSync, outputJSONSync } from 'fs-extra';
import { Logger } from '@verdaccio/types';

type GitInfo = {
  version: string;
  config: {
    'git-publish': {
      url: string;
      branch: string;
    };
  };
};

export const processComposerPackage = (path: string) => {
  if (isComposerPackage(path)) {
    removeComposerLock(path);
    setComposerPackageVersion(path);
    setComposerDependencyVersions(path);
    cleanNpmDependencies(path);
    removeLocalComposerRepository(path);
  }
};

export const isComposerPackage = (path: string) => {
  return fs.existsSync(`${path}/composer.json`);
};

export const removeComposerLock = (path: string) => {
  console.log('lock');
  if (fs.existsSync(`${path}/composer.lock`)) {
    fs.removeSync(`${path}/composer.lock`);
  }
};

export const setComposerPackageVersion = (path: string) => {
  const composer = readJSONSync(`${path}/composer.json`);
  const npm = readJSONSync(`${path}/package.json`);
  composer.version = npm.version;
  outputJSONSync(`${path}/composer.json`, composer, { spaces: 2 });
};

export const removeLocalComposerRepository = (path: string) => {
  const composer = readJSONSync(`${path}/composer.json`);
  if (composer.repositories) {
    composer.repositories = composer.repositories.filter(
      (rep: { type: string }) => rep.type !== 'path',
    );
    outputJSONSync(`${path}/composer.json`, composer, { spaces: 2 });
  }
};
export const setComposerDependencyVersions = (path: string) => {
  const composer = readJSONSync(`${path}/composer.json`);
  const npm = readJSONSync(`${path}/package.json`);
  if (composer.require && npm.dependencies) {
    Object.keys(composer.require).forEach((dep) => {
      if (npm.dependencies[`@-${dep}`]) {
        composer.require[dep] = npm.dependencies[`@-${dep}`];
      }
    });
    outputJSONSync(`${path}/composer.json`, composer, { spaces: 2 });
  }
};

export const cleanNpmDependencies = (path: string) => {
  const npm = readJSONSync(`${path}/package.json`);
  if (npm.dependencies) {
    const deps: { [key: string]: string } = {};
    npm.dependencies &&
      Object.keys(npm.dependencies).forEach((key) => {
        if (key.substr(0, 2) !== '@-') {
          deps[key] = npm.dependencies[key];
        }
      });
    npm.dependencies = deps;
    outputJSONSync(`${path}/package.json`, npm, { spaces: 2 });
  }
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

  const info = JSON.parse(
    fs.readFileSync(`${path}/package/package.json`).toString(),
  );

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
