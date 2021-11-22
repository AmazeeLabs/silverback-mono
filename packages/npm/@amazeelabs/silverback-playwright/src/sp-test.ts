#!/usr/bin/env ts-node-script

import axios from 'axios';
import { check as checkPort } from 'tcp-port-used';
import { $ } from 'zx';

import {
  spServeBaseUrl,
  spServeLogFile,
  spServePort,
  spTestsDir,
  tags,
  testTypes,
} from './constants';
import { EnvVars, TestType } from './types';
import { runDetached } from './utils';

if (process.argv.includes('help') || process.argv.includes('--help')) {
  console.log(`Usage: yarn sp-test [flags]
  Flags:
    -v, --verbose    Spam a lot
    -h, --headed     Run tests in headed browser (default: headless)
    -t, --trace      Record traces`);
  process.exit();
}

const headed = process.argv.includes('--headed') || process.argv.includes('-h');
const verbose =
  process.argv.includes('--verbose') || process.argv.includes('-v');
const trace = process.argv.includes('--trace') || process.argv.includes('-t');

$.verbose = verbose;
// We escape args ourselves.
$.quote = (arg) => arg;

process.env.SP_VERBOSE = verbose ? 'true' : '';

const runTests = async (testType: TestType) => {
  const envVars: EnvVars = {
    SP_TEST_DIR: `${process.cwd()}/${spTestsDir}`,
    SP_TEST_TYPE: testType,
    SP_VERBOSE: verbose ? 'true' : '',
    SP_TRACE: trace ? 'true' : '',
  };
  const envVarsString = Object.entries(envVars)
    .map(([k, v]) => `${k}='${v}'`)
    .join(' ');

  console.log(`⏩ Fetching ${testType} tests...`);
  const flags = [
    `--grep '${tags[testType]}'`,
    `--list`,
    `--config '${__dirname}/playwright.config.base.ts'`,
  ].join(' ');
  if (
    (await $`${envVarsString} yarn playwright test ${flags}`.exitCode) === 0
  ) {
    console.log(`⏩ Setting up environment...`);
    await axios.post(`${spServeBaseUrl}/${testType}-start`, envVars);

    console.log(`⏩ Running tests...`);
    const flags = [
      `--grep '${tags[testType]}'`,
      `--config '${__dirname}/playwright.config.complete.ts'`,
      '--workers 1', // Otherwise it can things in parallel.
      headed ? '--headed --timeout 6000000' : null,
      '--max-failures 1',
    ]
      .filter(Boolean)
      .join(' ');
    const run = $`${envVarsString} yarn playwright test ${flags}`;
    run.pipe(process.stdout);
    if ((await run.exitCode) !== 0) {
      console.error(`❌ ${testType} tests failed.`);
      process.exit(1);
    }
    console.log(`✅ ${testType} tests passed.`);
  } else {
    console.log(`☑️  No ${testType} tests found.`);
  }
};

void (async function () {
  // Ensure browser is installed.
  await $`yarn playwright install chromium`;

  // Start environment.
  if (verbose) {
    $`touch ${spServeLogFile} && tail -f ${spServeLogFile}`.pipe(
      process.stdout,
    );
  }
  if (!(await checkPort(spServePort))) {
    await runDetached({
      workDir: process.cwd(),
      command: 'yarn sp-serve',
      logFile: spServeLogFile,
      waitForOutput: 'sp-serve is ready',
    });
  }

  // Run tests.
  for (const type of testTypes) {
    await runTests(type);
  }

  // Cleanup.
  await axios.post(`${spServeBaseUrl}/stop`);
  process.exit();
})();
