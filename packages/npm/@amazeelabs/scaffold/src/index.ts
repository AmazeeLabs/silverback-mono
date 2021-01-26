import {
  adjustScripts,
  installPackages,
  manageIgnoredFiles,
  updateDotFiles,
} from './utils';

/**
 * Packages that are used by @amazeelabs/scaffold that are _not_ installed
 * in scaffolded projects.
 */
export const ignoredPackages = ['chalk', 'esm'];

/**
 * Files in @amazeelabs/scaffold that are _not_ installed in scaffolded projects.
 */
export const ignoredFiles = [
  'cli.js',
  'index.js',
  '.gitignore',
  'package.json',
  'test.sh',
  'README.md',
];

/**
 * Scripts in @amazeelabs/scaffold that are _not_ installed in scaffolded projects.
 */
export const ignoredScripts = ['prepare'];

export function scaffold(sourcePath: string, targetPath: string) {
  installPackages(sourcePath, targetPath, ignoredPackages);
  adjustScripts(sourcePath, targetPath, ignoredScripts);
  updateDotFiles(sourcePath, targetPath, ignoredFiles);
  manageIgnoredFiles(sourcePath, targetPath, ignoredFiles);
}
