import path from 'path';

import {
  installConfigFiles,
  installDependencies,
  installScripts,
} from './utils';

export function scaffold(targetPath: string) {
  const sourcePath = path.resolve(__dirname, './files');
  installDependencies(targetPath);
  installScripts(targetPath);
  installConfigFiles(sourcePath, targetPath);
}

scaffold(process.cwd());
