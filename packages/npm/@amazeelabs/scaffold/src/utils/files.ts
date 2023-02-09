import * as fs from 'fs';
import * as path from 'path';

export function installConfigFiles(sourcePath: string, targetPath: string) {
  const files = fs
    .readdirSync(sourcePath)
    .filter(
      (file) => !fs.lstatSync(path.resolve(sourcePath, file)).isDirectory(),
    );

  console.log(
    `[@amazeelabs/scaffold]: Installing configuration files (${Object.values(
      files,
    ).join(', ')})`,
  );

  files.forEach((file) => {
    const sourceFile = path.resolve(sourcePath, file);
    const targetFile = path.resolve(targetPath, file);
    if (fs.existsSync(targetFile)) {
      fs.unlinkSync(targetFile);
    }
    fs.copyFileSync(sourceFile, targetFile);
  });
}
