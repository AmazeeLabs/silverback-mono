#!/usr/bin/env node

import path from 'path';
import { $, fs, glob } from 'zx';

(async () => {
  const update = !!process.argv.find(
    (arg) => arg === '-u' || arg === '--updateSnapshot',
  );
  const verbose = !!process.argv.find(
    (arg) => arg === '-v' || arg === '--verbose',
  );

  $.verbose = verbose;
  // Do not escape args.
  $.quote = (arg) => arg;

  const folder = path.resolve(process.cwd(), process.argv[2]);

  if (update) {
    (await glob(`${folder}/**/*.snap`)).map((path) => fs.unlinkSync(path));
  }

  const args = [
    `--config ${path.resolve(__dirname, '..', 'jest.config.run.js')}`,
    update ? '--updateSnapshot' : null,
    verbose ? '--verbose' : null,
    'dist/tests.js',
  ]
    .filter(Boolean)
    .join(' ');
  const jestProcess = $`FOLDER='${folder}' yarn jest ${args}`;

  if (!verbose) {
    jestProcess.stdout.pipe(process.stdout);
    jestProcess.stderr.pipe(process.stderr);
  }

  // This is to suppress error stack trace from zx.
  if ((await jestProcess.exitCode) !== 0) {
    process.exit(1);
  }
})();
