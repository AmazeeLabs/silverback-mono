import { beforeEach, expect, test } from 'vitest';

import { setConfig } from '../../../tools/config';
import { TaskController } from '../../../tools/queue';
import { core } from '../../core';
import { defaultConfig, reset } from '../../tools/testing';
import { buildDeployTask } from './buildDeploy';

let output: Array<string> = [];

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];
});

test('3 deploy attempts', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      deploy: 'echo "deploy fail"; exit 1',
    },
  });
  await buildDeployTask(new TaskController());
  expect(core.state.getDeployJobState()).toBe('Error');
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "deploy fail"; exit 1"\n',
    'deploy fail\n',
    '❌ Command exited with 1: "echo "deploy fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "deploy fail"; exit 1"\n',
    'deploy fail\n',
    '❌ Command exited with 1: "echo "deploy fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "deploy fail"; exit 1"\n',
    'deploy fail\n',
    '❌ Command exited with 1: "echo "deploy fail"; exit 1"\n',
  ]);
});

test('deploy continues after few failing attempts', async () => {
  let attempt = 0;
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      get deploy(): string {
        attempt++;
        return attempt === 3
          ? 'echo "deploy success"'
          : 'echo "deploy fail"; exit 1';
      },
    },
  });
  await buildDeployTask(new TaskController());
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "deploy fail"; exit 1"\n',
    'deploy fail\n',
    '❌ Command exited with 1: "echo "deploy fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "deploy fail"; exit 1"\n',
    'deploy fail\n',
    '❌ Command exited with 1: "echo "deploy fail"; exit 1"\n',
    'ℹ️ Starting command: "echo "deploy success""\n',
    'deploy success\n',
    '✅ Command exited: "echo "deploy success""\n',
  ]);
  expect(core.state.getDeployJobState()).toBe('Success');
});

test('a cancelled deploy results in the error state', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      deploy: 'sleep 10',
    },
  });
  const controller = new TaskController();
  const resolved = buildDeployTask(controller);
  controller.cancel();
  await resolved;
  expect(core.state.getDeployJobState()).toBe('Error');
});
