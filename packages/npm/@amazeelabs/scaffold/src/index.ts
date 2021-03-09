import {
  adjustScripts,
  installPackages,
  manageIgnoredFiles,
  updateDotFiles,
} from './utils';

export function scaffold(sourcePath: string, targetPath: string) {
  installPackages(sourcePath, targetPath);
  adjustScripts(sourcePath, targetPath);
  updateDotFiles(sourcePath, targetPath);
  manageIgnoredFiles(sourcePath, targetPath);
}
