#!/usr/bin/env ts-node-script

import { $ } from 'zx';

import { drupal, gatsby } from './constants';
import { tags, TestType, testTypes } from './test-types';
import { port } from './utils';

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

const runTests = async (type: TestType) => {
  const envVars = [
    `SP_TEST_DIR='${process.cwd()}/playwright-tests'`,
    `SP_TEST_TYPE=${type}`,
    `SP_VERBOSE=${verbose ? 'true' : "''"}`,
    `SP_TRACE=${trace ? 'true' : "''"}`,
  ].join(' ');

  console.log(`⏩ Running ${type} tests...`);
  const list = $`${envVars} yarn playwright test --grep '${tags[type]}' --list --config '${__dirname}/list.playwright.config.ts'`;
  if ((await list.exitCode) === 0) {
    $.verbose = true;
    const run = $`${envVars} yarn playwright test --grep '${
      tags[type]
    }' --config '${__dirname}/${type}/playwright.config.ts' --max-failures 1 ${
      headed ? '--headed --timeout 600000' : ''
    }`;
    $.verbose = verbose;
    if ((await run.exitCode) !== 0) {
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
  await port.killIfUsed(drupal.port);
  await port.killIfUsed(gatsby.port);
  await port.killIfUsed(gatsby.fastBuilds.port);
})();
