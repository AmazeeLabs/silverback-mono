import chalk from 'chalk';
import fs from 'fs';

import { RecipeError } from './errors';
import { log } from './logger';

export const readJsonFile = (path: string) => {
  if (!fs.existsSync(path)) {
    throw new RecipeError(
      `The file ${chalk.blue(`${process.cwd()}/${path}`)} does ${chalk.red(
        'not exist',
      )}.`,
    );
  }
  const contents = fs.readFileSync(path).toString();
  try {
    return JSON.parse(contents);
  } catch (err) {
    throw new RecipeError(err.message);
  }
};

export const writeJsonFile = (path: string, contents: any) => {
  fs.writeFileSync(path, JSON.stringify(contents, null, 2));
  log.debug(`updated ${chalk.blue(path)}`);
};

export const updateJsonFile = (
  path: string,
  updater: (json: { [key: string]: any }) => { [key: string]: any },
) => {
  try {
    const data = readJsonFile(path);
    log.silly(`current content of ${chalk.blue(path)}:`, data);
    const updated = updater(data);
    writeJsonFile(path, updated);
    log.silly(`new content of ${chalk.blue(path)}:`, updated);
  } catch (err) {
    if (err instanceof RecipeError) {
      // Generate a new recipe error and re-throw it.
      // This will make sure the code frame shows the call to `updateJsonFile`
      // in the recipe rather than this file.
      throw new RecipeError(err.message);
    }
    throw err;
  }
};
