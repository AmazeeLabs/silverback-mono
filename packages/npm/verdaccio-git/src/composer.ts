import fs, { readJSONSync, outputJSONSync } from 'fs-extra';

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
