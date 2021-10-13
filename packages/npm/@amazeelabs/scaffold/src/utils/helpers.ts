import * as fs from 'fs';
import * as path from 'path';

type Map = { [key: string]: string };

type PackageInfo = {
  peerDependencies?: Map;
  devDependencies?: Map;
  dependencies?: Map;
  scripts?: Map;
  [key: string]: any;
};

export function readPackageInfo(packagePath: string): PackageInfo {
  const filePath = path.resolve(packagePath, 'package.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`${packagePath} does not contain a package.json file`);
  }
  return JSON.parse(fs.readFileSync(filePath).toString());
}

export function writePackageInfo(packagePath: string, info: PackageInfo) {
  const filePath = path.resolve(packagePath, 'package.json');
  if (!fs.existsSync(filePath)) {
    throw new Error(`${packagePath} does not contain a package.json file`);
  }
  fs.writeFileSync(filePath, JSON.stringify(info, null, 2) + '\n');
}
