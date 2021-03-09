import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export const START = '### MANAGED BY @amazeelabs/scaffold - START';
export const END = '### MANAGED BY @amazeelabs/scaffold - END';

export function manageIgnoredFiles(
  sourcePath: string,
  targetPath: string,
) {
  const files = fs
    .readdirSync(sourcePath)
    .filter(
      (file) => !fs.lstatSync(path.resolve(sourcePath, file)).isDirectory(),
    );

  const targetFile = path.resolve(targetPath, '.gitignore');

  const targetExists = fs.existsSync(targetFile);
  const lines = targetExists
    ? fs.readFileSync(targetFile).toString().split('\n')
    : [];
  const start = lines.includes(START) ? lines.indexOf(START) : lines.length;
  const end = lines.includes(END) ? lines.indexOf(END) : lines.length;
  console.log(
    `${chalk.yellow(
      '[@amazeelabs/scaffold]:',
    )} Adding files to .gitignore (${Object.values(files).join(', ')})`,
  );
  lines.splice(start, end - start + 1, ...[START, ...files, END]);
  fs.writeFileSync(targetFile, lines.join('\n'));
}
