import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export function updateDotFiles(
  sourcePath: string,
  targetPath: string,
) {
  const files = fs
    .readdirSync(sourcePath)
    .filter(file => file !== 'package.json')
    .filter(
      (file) =>
        !(
          fs.lstatSync(path.resolve(sourcePath, file)).isDirectory()
        ),
    );

  console.log(
    `${chalk.yellow(
      '[@amazeelabs/scaffold]:',
    )} Installing configuration files (${Object.values(files).join(', ')})`,
  );

  files.forEach((file) => {
    const sourceFile = path.resolve(sourcePath, file);
    const targetFile = path.resolve(targetPath, file);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    fs.copyFileSync(sourceFile, targetFile);
  });
  const tsconfigPath = path.resolve(targetPath, 'tsconfig.json');
  if (!fs.existsSync(tsconfigPath)) {
    fs.writeFileSync(tsconfigPath, JSON.stringify({
      extends: '@tsconfig/recommended/tsconfig.json',
      compilerOptions: {
        jsx: "react"
      }
    }))
  }
}
