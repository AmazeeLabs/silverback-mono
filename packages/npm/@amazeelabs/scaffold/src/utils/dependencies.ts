import chalk from 'chalk';

import eslintConfig from '../../../eslint-config/package.json';
import jestPreset from '../../../jest-preset/package.json';
import prettierConfig from '../../../prettier-config/package.json';
import localPackages from '../../package.json';
import { readPackageInfo, writePackageInfo } from './helpers';

export function installDependencies(targetPath: string) {
  const targetInfo = readPackageInfo(targetPath);

  const dependenciesToInstall = {
    typescript: `^${localPackages.devDependencies.typescript}`,
    [jestPreset.name]: `^${jestPreset.version}`,
    ...jestPreset.peerDependencies,
    [eslintConfig.name]: `^${eslintConfig.version}`,
    ...eslintConfig.peerDependencies,
    [prettierConfig.name]: `^${prettierConfig.version}`,
    ...prettierConfig.peerDependencies,
  };

  console.log(
    `${chalk.yellow(
      '[@amazeelabs/scaffold]:',
    )} Adding devDependencies (${Object.keys(dependenciesToInstall).join(
      ', ',
    )})`,
  );

  writePackageInfo(targetPath, {
    ...targetInfo,
    devDependencies: {
      ...targetInfo.devDependencies,
      ...dependenciesToInstall,
    },
  });
}
