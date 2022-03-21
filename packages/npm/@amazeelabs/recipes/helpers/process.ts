import chalk from 'chalk';
import { spawnSync, StdioOptions } from 'child_process';

import { RecipeError } from './errors';
import { log } from './logger';

type Matcher = ((input: string) => undefined | string) | RegExp;

type Assert = {
  stdout?: Matcher;
  stderr?: Matcher;
  code?: number;
};

export function chdir(path: string) {
  process.chdir(path);
  log.info(`switched into ${chalk.cyan(path)}`);
}

export function run(
  cmd: string,
  options?: {
    cwd?: string;
    assert?: Assert;
    stdio?: StdioOptions;
  },
) {
  const cwd = options?.cwd;
  const assert = options?.assert || { code: 0 };
  const stdio = options?.stdio;

  log.info(
    `running ${chalk.yellow(cmd)}${cwd ? ` in ${chalk.cyan(cwd)}` : ''}`,
  );
  const response = spawnSync(cmd, {
    shell: 'bash',
    cwd,
    stdio,
  });
  log.debug(
    `${chalk.blue(cmd)} returned with exit code ${
      response.status === 0
        ? chalk.green(response.status)
        : chalk.red(response.status)
    }`,
  );
  const stdout = response.stdout?.toString();
  const stderr = response.stderr?.toString();
  if (stdout) {
    log.silly(
      `${chalk.green('stdout')} of ${chalk.blue(cmd)}:\n${chalk.green(stdout)}`,
    );
  }
  if (stderr && stderr !== stdout) {
    log.silly(
      `${chalk.red('stderr')} of ${chalk.blue(cmd)}:\n${chalk.red(stderr)}`,
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
          }, but received:\n${chalk.red(response.stderr.toString().trim())}`,
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
