import chalk from 'chalk';
import { spawnSync } from 'child_process';

import { RecipeError } from './errors';
import { log } from './logger';

type Matcher = ((input: string) => undefined | string) | RegExp;

type Assert = {
  stdout?: Matcher;
  stderr?: Matcher;
  code?: number;
};

const isAssert = (val?: Assert | string): val is Assert =>
  typeof val !== 'string' && typeof val !== 'undefined';

const isCwd = (val?: Assert | string): val is string =>
  typeof val === 'string' && typeof val !== 'undefined';

export function chdir(path: string) {
  process.chdir(path);
  log.info(`switched into ${chalk.cyan(path)}`);
}

export function run(cmd: string): void;
export function run(cmd: string, cwd: string): void;
export function run(cmd: string, assert: Assert): void;
export function run(cmd: string, assert: Assert, cwd: string): void;
export function run(cmd: string, cwd: string, assert: Assert): void;

export function run(
  cmd: string,
  arg1?: Assert | string,
  arg2?: Assert | string,
) {
  const cwd: string | undefined = isCwd(arg1)
    ? arg1
    : isCwd(arg2)
    ? arg2
    : undefined;
  const assert: Assert = isAssert(arg1)
    ? arg1
    : isAssert(arg2)
    ? arg2
    : { code: 0 };

  log.info(
    `running ${chalk.yellow(cmd)}${cwd ? ` in ${chalk.cyan(cwd)}` : ''}`,
  );
  const response = spawnSync(cmd, {
    shell: 'bash',
    cwd,
  });
  log.debug(
    `${chalk.blue(cmd)} returned with exit code ${
      response.status === 0
        ? chalk.green(response.status)
        : chalk.red(response.status)
    }`,
  );
  const stdout = response.stdout.toString();
  const stderr = response.stderr.toString();
  if (stdout) {
    log.silly(
      `${chalk.green('stdout')} of ${chalk.blue(cmd)}:\n${chalk.green(stdout)}`,
    );
  }
  if (stderr && stderr !== stdout) {
    log.silly(
      `${chalk.red('stderr')} of ${chalk.blue(cmd)}:\n${chalk.red(stdout)}`,
    );
  }

  if (typeof assert.code !== 'undefined' && response.status !== assert.code) {
    throw new RecipeError(
      `Expected exit code ${chalk.green(assert.code)} for command ${chalk.blue(
        cmd,
      )} but received ${chalk.red(response.status)}`,
    );
  }

  if (assert.stdout) {
    if (assert.stdout instanceof RegExp) {
      if (!assert.stdout.test(response.stdout.toString().trim())) {
        throw new RecipeError(
          `Expected output of command ${chalk.blue(cmd)} to match ${
            assert.stdout
          }, but received:\n${chalk.red(response.stdout.toString().trim())}`,
        );
      }
    } else {
      const err = assert.stdout(response.stdout.toString().trim());
      if (err) {
        throw new RecipeError(
          `Unexpected output of command ${chalk.blue(cmd)}: ${chalk.red(err)}`,
        );
      }
    }
  }

  if (assert.stderr) {
    if (assert.stderr instanceof RegExp) {
      if (!assert.stderr.test(response.stderr.toString().trim())) {
        throw new RecipeError(
          `Expected error output of command ${chalk.blue(cmd)} to match ${
            assert.stderr
          }, but received:\n${chalk.red(response.stdout.toString().trim())}`,
        );
      }
    } else {
      const err = assert.stderr(response.stderr.toString().trim());
      if (err) {
        throw new RecipeError(
          `Unexpected error output of command ${chalk.blue(cmd)}: ${chalk.red(
            err,
          )}`,
        );
      }
    }
  }

  return true;
}
