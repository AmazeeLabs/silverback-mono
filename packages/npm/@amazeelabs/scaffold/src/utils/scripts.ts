import { readPackageInfo, writePackageInfo } from './helpers';

export function installScripts(targetPath: string) {
  const targetInfo = readPackageInfo(targetPath);

  const sourceScripts: { [key: string]: string } = {
    prepare: 'exit 0',
    precommit: 'lint-staged',
    'test:static':
      'tsc --noEmit && eslint "**/*.{ts,tsx,js,jsx}" --ignore-path="./.gitignore" --fix',
    'test:unit': 'jest --passWithNoTests',
    'test:integration': 'exit 0',
    'test:watch': 'jest --watch',
  };

  console.log(
    `[@amazeelabs/scaffold]: Adjusting scripts (${Object.keys(
      sourceScripts,
    ).join(', ')})`,
  );

  writePackageInfo(targetPath, {
    ...targetInfo,
    scripts: {
      ...targetInfo.scripts,
      ...sourceScripts,
    },
  });
}
