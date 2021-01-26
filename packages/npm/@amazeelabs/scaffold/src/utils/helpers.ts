import * as fs from 'fs';
import * as path from 'path';

export function getPackageInfo(packagePath: string) {
  const filePath = path.resolve(packagePath, 'package.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`${packagePath} does not contain a package.json file`);
  }
  return JSON.parse(fs.readFileSync(filePath).toString());
}
