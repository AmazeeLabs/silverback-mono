import { existsSync } from 'fs';
import { sync } from 'glob';

export function scanDirectory(dir: string) {
  if (!existsSync(dir)) {
    throw `Directory "${dir}" does not exist.`;
  }
  const files = [
    ...sync('./**/*.gql', { cwd: dir }),
    ...sync('./**/*.graphqls', { cwd: dir }),
    ...sync('./**/*.graphql', { cwd: dir }),
  ];
  return files;
}
