import { beforeEach, expect, test } from 'vitest';

import { setConfig } from '../../../tools/config';
import { TaskController } from '../../../tools/queue';
import { core } from '../../core';
import { defaultConfig, reset } from '../../tools/testing';
import { buildRunTask } from './buildRun';

let output: Array<string> = [];

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];
});

test('3 build attempts', async () => {
  core.state.setBuildNumber(999);
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });
  await buildRunTask(new TaskController());
  expect(core.state.getBuildJobState()).toBe('Error');
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
  ]);
});

test('first build failure triggers a clean', async () => {
  core.state.setBuildNumber(1);
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: { command: 'echo "build fail"; exit 1' },
    },
  });
  await buildRunTask(new TaskController());
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
  expect(core.state.getBuildJobState()).toBe('Error');
});

test('build continues after few failing attempts', async () => {
  core.state.setBuildNumber(999);
  let attempt = 0;
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      get build(): { command: string } {
        attempt++;
        return attempt === 3
          ? { command: 'echo "build success"' }
          : { command: 'echo "build fail"; exit 1' };
      },
    },
  });
  await buildRunTask(new TaskController());
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build fail"; exit 1"\n',
    'build fail\n',
    '❌ Command exited with 1: "echo "build fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "build success""\n',
    'build success\n',
    '✅ Command exited: "echo "build success""\n',
  ]);
  expect(core.state.getBuildJobState()).toBe('Success');
});

test('a cancelled build results in the error state', async () => {
  setConfig(defaultConfig);
  const controller = new TaskController();
  const resolved = buildRunTask(controller);
  controller.cancel();
  await resolved;
  expect(core.state.getBuildJobState()).toBe('Error');
});
