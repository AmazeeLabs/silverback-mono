import { beforeEach, expect, test, vi } from 'vitest';

import { core } from '../core';
import { setConfig } from '../tools/config';
import { saveBuildInfo } from '../tools/database';
import { TaskController } from '../tools/queue';
import { defaultConfig, reset } from '../tools/testing';
import { buildTask } from './build';

let output: Array<string> = [];

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];

  vi.clearAllMocks();
});

test('only the first build loads the saved build', async () => {
  setConfig({
    ...defaultConfig,
    persistentBuilds: {
      buildPaths: ['build', '.cache'],
      saveTo: '/tmp/build',
    },
  });

  const controller = new TaskController();

  await buildTask()(controller);
  expect(output).toContain('ℹ️ Loading the build\n');
  expect(output).toContain('ℹ️ Saving the build\n');

  output = [];

  await buildTask()(controller);
  expect(output).not.toContain('ℹ️ Loading the build\n');
  expect(output).toContain('ℹ️ Saving the build\n');
});

test('buildRunTask stops the build queue', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });

  const controller = new TaskController();

  await buildTask()(controller);
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "clean""\n',
    'clean\n',
    '✅ Command exited: "echo "clean""\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
  ]);
});

test('successful builds are saved to database', async () => {
  const date = '\\d{4}-\\d{2}-\\d{2} \\d{2}:\\d{2}:\\d{2}';
  setConfig(defaultConfig);
  await buildTask()(new TaskController());
  await buildTask()(new TaskController());
  expect(saveBuildInfo).toHaveBeenCalledTimes(2);
  expect(saveBuildInfo).toHaveBeenNthCalledWith(1, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: true,
    type: 'full',
    logs: expect.stringMatching(
      new RegExp(
        `${date} ℹ️ Starting command: "echo "build""
${date} build
${date} ✅ Command exited: "echo "build""
${date} ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"
${date} serve
${date} ℹ️ Starting command: "echo "deploy""
${date} deploy
${date} ✅ Command exited: "echo "deploy""`,
        's',
      ),
    ),
  });
  expect(saveBuildInfo).toHaveBeenNthCalledWith(2, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: true,
    type: 'incremental',
    logs: expect.stringMatching(
      new RegExp(
        `${date} ℹ️ Starting command: "echo "build""
${date} build
${date} ✅ Command exited: "echo "build""
${date} ℹ️ Starting command: "echo "deploy""
${date} deploy
${date} ✅ Command exited: "echo "deploy""`,
        's',
      ),
    ),
  });
});

test('failed builds are saved to database', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });
  await buildTask()(new TaskController());
  await buildTask()(new TaskController());
  expect(saveBuildInfo).toHaveBeenCalledTimes(2);
  expect(saveBuildInfo).toHaveBeenNthCalledWith(1, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: false,
    type: 'full',
    logs: expect.any(String),
  });
  expect(saveBuildInfo).toHaveBeenNthCalledWith(2, {
    startedAt: expect.any(Number),
    finishedAt: expect.any(Number),
    success: false,
    type: 'incremental',
    logs: expect.any(String),
  });
});
