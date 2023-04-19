import { beforeEach, expect, test } from 'vitest';

import { core } from '../../core';
import { setConfig } from '../../tools/config';
import { TaskController } from '../../tools/queue';
import { defaultConfig, reset } from '../../tools/testing';
import { serveStartTask } from './serveStart';
import { serveStopTask } from './serveStop';

let output: Array<string> = [];

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];
});

test('serve works', async () => {
  setConfig(defaultConfig);
  await serveStartTask(new TaskController());
  expect(core.serveProcess).not.toBe(null);
});

test('serve can timeout', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      serve: {
        command: 'echo "serve"; while true; do sleep 86400; done',
        readyPattern: 'BAD PATTERN',
        readyTimeout: 500,
        port: 3001,
      },
    },
  });
  await serveStartTask(new TaskController());
  await new Promise((resolve) => setTimeout(resolve, 1000));
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
    '⚠️ Could not find the serve ready pattern in 500ms\n',
  ]);
  expect(core.serveProcess).not.toBe(null);
});

test('serve can be restarted', async () => {
  setConfig(defaultConfig);
  await serveStartTask(new TaskController());
  await serveStopTask(new TaskController());
  await serveStartTask(new TaskController());
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
    'ℹ️ Killing command: "echo "serve"; while true; do sleep 86400; done"\n',
    '✅ Command killed with SIGINT signal: "echo "serve"; while true; do sleep 86400; done"\n',
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
  ]);
});

test('start serve can be called multiple times', async () => {
  setConfig(defaultConfig);
  await serveStartTask(new TaskController());
  await serveStartTask(new TaskController());
  await serveStartTask(new TaskController());
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
  ]);
});

test('serve task can be cancelled while serving', async () => {
  setConfig(defaultConfig);
  const controller = new TaskController();
  await serveStartTask(controller);
  controller.cancel();
  expect(core.serveProcess).not.toBeNull();
  const { exitCode } = await core.serveProcess!.result;
  expect(exitCode === null || typeof exitCode === 'number').toBeTruthy();
  expect(core.serveProcess).toBeNull();
});

test('serve task can be cancelled while starting', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      serve: {
        command:
          'echo "starting"; sleep 2; echo "started"; while true; do sleep 86400; done',
        readyPattern: 'started',
        port: 3001,
      },
    },
  });
  const controller = new TaskController();
  serveStartTask(controller);
  await new Promise((resolve) => setTimeout(resolve, 100));
  expect(core.serveProcess).not.toBeNull();
  controller.cancel();
  await core.serveProcess!.result;
  expect(core.serveProcess).toBeNull();
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "starting"; sleep 2; echo "started"; while true; do sleep 86400; done"\n',
    'starting\n',
    'ℹ️ Killing command: "echo "starting"; sleep 2; echo "started"; while true; do sleep 86400; done"\n',
    '✅ Command killed with SIGINT signal: "echo "starting"; sleep 2; echo "started"; while true; do sleep 86400; done"\n',
  ]);
});
