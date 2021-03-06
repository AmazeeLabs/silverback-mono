import chalk from 'chalk';
import * as fs from 'fs';

import { getPackageInfo } from './helpers';

type Map = {
  [key: string]: string;
};

export function adjustScripts(
  sourcePath: string,
  targetPath: string,
) {
  const sourceInfo: { scripts: Map } = getPackageInfo(sourcePath);
  const targetInfo: { name: string, scripts?: Map } = getPackageInfo(targetPath);
  const sourceScripts = Object.assign(
    {},
    {
      prepare: 'amazee-scaffold',
    },
    sourceInfo.scripts || {},
  );

  console.log(
    `${chalk.yellow(
      '[@amazeelabs/scaffold]:',
    )} Adjusting scripts (${Object.keys(sourceScripts).join(', ')})`,
  );
  Object.keys(sourceScripts).forEach((key) => {
    targetInfo.scripts = targetInfo.scripts || {};
    if (targetInfo.scripts[key]) {
      if (key === 'prepare' && targetInfo.name === '@amazeelabs/scaffold') {
        // Don't install a prepare hook in our own package.
        return;
      }
      if (
        !(targetInfo.scripts[key] as string).includes(
          sourceScripts[key] as string,
        )
      ) {
        targetInfo.scripts[
          key
        ] = `${sourceScripts[key]} && ${targetInfo.scripts[key]}`;
      }
    } else {
      targetInfo.scripts[key] = sourceScripts[key] as string;
    }
  });
  fs.writeFileSync(
    `${targetPath}/package.json`,
    JSON.stringify(targetInfo, null, 2) + "\n",
  );
}
