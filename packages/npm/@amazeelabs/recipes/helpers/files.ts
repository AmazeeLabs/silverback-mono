import chalk from 'chalk';
import fs from 'fs';
import yaml from 'js-yaml';
import { renderString } from 'nunjucks';
import path from 'path';

import { RecipeError } from './errors';
import { log } from './logger';
import { run } from './process';

export function processUppercasedVariables(input: string) {
  let output = input;
  Object.keys(_vars)
    .filter((name) => /^[A-Z_]+$/.test(name))
    .forEach((name) => {
      output = output.replace(new RegExp(name, 'g'), `{{${name}}}`);
    });
  return output;
}

const _vars = {};
export const vars = (vars: any) => Object.assign(_vars, vars);

export const file = (
  filename: string,
  processor: (data: any) => any = (data) => data,
): any => {
  try {
    const content = fs.existsSync(filename)
      ? fs.readFileSync(filename).toString()
      : null;
    if (filename.match(/\.json$/)) {
      const data = processor(content ? JSON.parse(content) : {});
      fs.writeFileSync(filename, JSON.stringify(data, null, 2));
      log.info(`updated ${chalk.cyan(filename)}`);
      return data;
    }
    if (filename.match(/\.ya?ml$/)) {
      const data = processor(content ? yaml.load(content) : {});
      fs.writeFileSync(
        filename,
        yaml.dump(data, {
          indent: 2,
        }),
      );
      log.info(`updated ${chalk.cyan(filename)}`);
      return data;
    }
    const data = processor(content ? content.split('\n') : []);
    fs.writeFileSync(filename, data.join('\n'));
    log.info(`updated ${chalk.cyan(filename)}`);
    return data;
  } catch (err) {
    // Generate a new recipe error and re-throw it.
    // This will make sure the code frame shows the call to `file`
    // in the recipe rather than this file.
    throw new RecipeError((err as any).message);
  }
};

export const __writeFile = (source: string, target: string) => {
  const targetName = renderString(processUppercasedVariables(target), _vars);
  const targetPath = path.resolve(process.cwd(), targetName);
  const targetDir = path.dirname(targetPath);
  if (!fs.existsSync(targetDir)) {
    run(`mkdir -p '${targetDir}'`);
  }
  const sourcePath = path.resolve(__dirname, '../files', source);
  if (fs.existsSync(target)) {
    run(`rm -rf ${targetPath}`);
  }
  const content = renderString(
    processUppercasedVariables(fs.readFileSync(sourcePath).toString()),
    _vars,
  );
  fs.writeFileSync(targetPath, content);
  log.info(`updated ${chalk.cyan(targetName)}`);
  log.silly(`contents of ${chalk.cyan(targetName)}:\n${content}\n`);
};

export const __appendFile = (source: string, target: string) => {
  const targetName = renderString(processUppercasedVariables(target), _vars);
  const targetPath = path.resolve(process.cwd(), targetName);
  const sourcePath = path.resolve(__dirname, '../files', source);
  const content = renderString(
    processUppercasedVariables(fs.readFileSync(sourcePath).toString()),
    _vars,
  );
  fs.appendFileSync(targetPath, content);
  log.info(`updated ${chalk.cyan(targetName)}`);
  log.silly(`contents of ${chalk.cyan(targetName)}:\n${content}\n`);
};
