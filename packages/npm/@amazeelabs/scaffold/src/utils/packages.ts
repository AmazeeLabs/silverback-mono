import chalk from 'chalk';
import { execSync } from 'child_process';

import { getPackageInfo } from './helpers';

type Map = {
  [key: string]: string;
};

type PackageJson = {
  dependencies?: Map;
  devDependencies?: Map;
};

function installDependencies(source: Map, target: Map) {
  const dependenciesToInstall = Object.keys(source).filter(
    (dep) => !Object.keys(target).includes(dep),
  );

  if (dependenciesToInstall.length > 0) {
    console.log(
      `${chalk.yellow(
        '[@amazeelabs/scaffold]:',
      )} Installing devDependencies (${dependenciesToInstall.join(', ')})`,
    );
    execSync(`yarn add -D --ignore-engines ${dependenciesToInstall.join(' ')}`, {
      stdio: 'inherit',
    });
  }
}

export function installPackages(
  sourcePath: string,
  targetPath: string,
) {
  const sourceInfo: PackageJson = getPackageInfo(sourcePath);
  const targetInfo: PackageJson = getPackageInfo(targetPath);

  installDependencies(
    sourceInfo.dependencies || {},
    targetInfo.devDependencies || {},
  );
}
