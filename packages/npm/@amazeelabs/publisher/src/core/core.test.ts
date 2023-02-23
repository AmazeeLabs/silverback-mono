import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Subscription } from 'rxjs';
import { beforeEach, expect, test } from 'vitest';

import { core } from './core';
import { setConfig } from './tools/config';
import { defaultConfig, reset } from './tools/testing';

let output: Array<string> = [];
let states: Array<ApplicationState> = [];
let stateSubscription: Subscription | null = null;

beforeEach(async () => {
  await reset();

  core.output$.subscribe((chunk) => {
    output.push(chunk);
  });
  output = [];

  if (stateSubscription) {
    stateSubscription.unsubscribe();
  }
  stateSubscription = core.state.applicationState$.subscribe((state) => {
    states.push(state);
  });
  states = [];
});

test('start() should run the build task', async () => {
  setConfig(defaultConfig);
  await core.start();
  await core.queue.whenIdle;
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build""\n',
    'build\n',
    '✅ Command exited: "echo "build""\n',
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
    'ℹ️ Starting command: "echo "deploy""\n',
    'deploy\n',
    '✅ Command exited: "echo "deploy""\n',
  ]);
});

test('skipInitialBuild option', async () => {
  setConfig(defaultConfig);
  await core.start({ skipInitialBuild: true });
  await core.queue.whenIdle;
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
  ]);
});

test('multiple build() calls do queue a single build', async () => {
  setConfig(defaultConfig);
  await core.start();
  core.build();
  core.build();
  core.build();
  await core.queue.whenIdle;
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build""\n',
    'build\n',
    '✅ Command exited: "echo "build""\n',
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
    'ℹ️ Starting command: "echo "deploy""\n',
    'deploy\n',
    '✅ Command exited: "echo "deploy""\n',
    'ℹ️ Starting command: "echo "build""\n',
    'build\n',
    '✅ Command exited: "echo "build""\n',
    'ℹ️ Starting command: "echo "deploy""\n',
    'deploy\n',
    '✅ Command exited: "echo "deploy""\n',
  ]);
});

test('clean() restarts the build', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: 'echo "build starting"; sleep 1; echo "build done"',
    },
  });
  await core.start();
  await new Promise((resolve) => setTimeout(resolve, 100));
  await core.clean();
  await core.queue.whenIdle;
  expect(output).toStrictEqual([
    'ℹ️ Starting command: "echo "build starting"; sleep 1; echo "build done""\n',
    'build starting\n',
    'ℹ️ Killing command: "echo "build starting"; sleep 1; echo "build done""\n',
    expect.stringMatching(
      /^❌ Command exited with ((null)|(\d+)): "echo "build starting"; sleep 1; echo "build done""\n$/,
    ),
    'ℹ️ Starting command: "echo "clean""\n',
    'clean\n',
    '✅ Command exited: "echo "clean""\n',
    'ℹ️ Starting command: "echo "build starting"; sleep 1; echo "build done""\n',
    'build starting\n',
    'build done\n',
    '✅ Command exited: "echo "build starting"; sleep 1; echo "build done""\n',
    'ℹ️ Starting command: "echo "serve"; while true; do sleep 86400; done"\n',
    'serve\n',
    'ℹ️ Starting command: "echo "deploy""\n',
    'deploy\n',
    '✅ Command exited: "echo "deploy""\n',
  ]);
});

test('applicationState$ all success', async () => {
  setConfig(defaultConfig);
  await core.start();
  await core.queue.whenIdle;
  core.build();
  await core.queue.whenIdle;
  await core.clean();
  await core.queue.whenIdle;
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
    ApplicationState.Ready,
    ApplicationState.Starting,
    ApplicationState.Ready,
  ]);
});

test('applicationState$ initial build error', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: 'echo "build fail"; exit 1',
    },
  });
  await core.start();
  await core.queue.whenIdle;
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Fatal,
  ]);
});

test('applicationState$ initial deploy error', async () => {
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      deploy: 'echo "deploy fail"; exit 1',
    },
  });
  await core.start();
  await core.queue.whenIdle;
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Fatal,
  ]);
});

test('applicationState$ build error', async () => {
  setConfig(defaultConfig);
  await core.start();
  await core.queue.whenIdle;
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      build: 'echo "build fail"; exit 1',
    },
  });
  core.build();
  await core.queue.whenIdle;
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
    ApplicationState.Updating,
    ApplicationState.Error,
  ]);
});

test('applicationState$ does not report intermediate failing attempts', async () => {
  let attempt = 0;
  setConfig({
    ...defaultConfig,
    commands: {
      ...defaultConfig.commands,
      get build(): string {
        attempt++;
        return attempt === 3
          ? 'echo "build success"'
          : 'echo "build fail"; exit 1';
      },
    },
  });
  await core.start();
  await core.queue.whenIdle;
  expect(states).toStrictEqual([
    ApplicationState.Starting,
    ApplicationState.Ready,
  ]);
});
