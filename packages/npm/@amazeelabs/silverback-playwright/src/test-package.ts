#!/usr/bin/env ts-node-script

import { $ } from 'zx';

import { getConfig } from './config';
import { tags, TestType, testTypes } from './test-types';
import { port } from './utils';

if (process.argv.includes('help') || process.argv.includes('--help')) {
  console.log(`Usage: yarn sp-test [flags]
  Flags:
    -v, --verbose    Spam a lot
    -h, --headed     Run tests in headed browser (default: headless)
    -r, --repeat     Repeat the tests 100 times
    -t, --trace      Record traces`);
  process.exit();
}

const headed = process.argv.includes('--headed') || process.argv.includes('-h');
const repeat = process.argv.includes('--repeat') || process.argv.includes('-r');
const verbose =
  process.argv.includes('--verbose') || process.argv.includes('-v');
const trace = process.argv.includes('--trace') || process.argv.includes('-t');

$.verbose = verbose;
// We escape args ourselves.
$.quote = (arg) => arg;

const runTests = async (type: TestType) => {
  const envVars: Record<string, string> = {
    SP_TEST_DIR: `${process.cwd()}/playwright-tests`,
    SP_TEST_TYPE: type,
    SP_VERBOSE: verbose ? 'true' : '',
    SP_TRACE: trace ? 'true' : '',
  };
  for (const k in envVars) {
    process.env[k] = envVars[k];
  }
  const envVarsString = Object.entries(envVars)
    .map(([k, v]) => `${k}='${v}'`)
    .join(' ');

  console.log(`⏩ Running ${type} tests...`);
  const listFlags = [
    `--grep '${tags[type]}'`,
    '--list',
    `--config '${__dirname}/list.playwright.config.ts'`,
  ].join(' ');
  const listProcess = $`${envVarsString} yarn playwright test ${listFlags}`;
  if ((await listProcess.exitCode) === 0) {
    const runFlags = [
      `--grep '${tags[type]}'`,
      `--config '${__dirname}/${type}/playwright.config.ts'`,
      '--workers 1', // Otherwise it can things in parallel.
      headed ? '--headed --timeout 6000000' : null,
      repeat ? '--repeat-each 100 --max-failures 100' : '--max-failures 1',
    ]
      .filter(Boolean)
      .join(' ');
    const runProcess =
      $`${envVarsString} yarn playwright test ${runFlags}`.pipe(process.stdout);
    if ((await runProcess.exitCode) !== 0) {
      console.error(`❌ ${type} tests failed.`);
      process.exit(1);
    }
    console.log(`✅ ${type} tests passed.`);
  } else {
    console.log(`☑️ No ${type} tests found.`);
  }
};

void (async function () {
  // Ensure browser is installed.
  await $`yarn playwright install chromium`;

  for (const type of testTypes) {
    await runTests(type);
  }

  // It would be better if relevant test types do it in their globalTeardown,
  // but somehow this makes zx to output error messages. E.g. it prints all
  // drush output following by "drush serve was killed with signal 9".
  // If we do the cleanup here, there is no output. 🤷
  console.log('ℹ️  Cleaning up...');
  const { drupal, gatsby } = getConfig();
  await port.killIfUsed(drupal.port);
  await port.killIfUsed(gatsby.allPorts);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
