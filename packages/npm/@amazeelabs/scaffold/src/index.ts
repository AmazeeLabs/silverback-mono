import path from 'path';

import {
  adjustScripts,
  installPackages,
  manageIgnoredFiles,
  updateDotFiles,
} from './utils';

export function scaffold(targetPath: string) {
  const sourcePath = path.resolve(__dirname, '../files');
  installPackages(sourcePath, targetPath);
  adjustScripts(sourcePath, targetPath);
  updateDotFiles(sourcePath, targetPath);
  manageIgnoredFiles(sourcePath, targetPath);
}
