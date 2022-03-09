import { mapValues } from 'lodash-es';
import { filter, interval, share, take, takeUntil } from 'rxjs';
import { RunHelpers } from 'rxjs/testing';

import { BuildState } from '../states';
import { BuildService, isBuildState, isQueueStatus } from './build';
import { runScheduled, ShellMock, stdoutChunk } from './helpers';
import { isSpawnChunk } from './spawn';

jest.mock('./spawn');

const outputChunks = {
  a: stdoutChunk('build step 1'),
  b: stdoutChunk('build step 2'),
  c: stdoutChunk('build step 3'),
  d: stdoutChunk('build step 3'),
  e: stdoutChunk('build step 5'),
};

const payloads = {
  x: 'x',
  y: 'y',
  z: 'z',
};

type BuildTestInput = {
  eventMarbles: string;
  buildMarbles: string;
  printMarbles: string;
  stateMarbles: string;
  queueMarbles: string;
  spawnMarbles: string;
  payloads: Record<string, Array<any>>;
};

function runBuildService(helpers: RunHelpers, input: BuildTestInput) {
  ShellMock.add('yarn build', helpers.cold(input.buildMarbles, outputChunks));

  const fakeCommands$ = helpers.hot(input.eventMarbles, payloads);

  const testSpan$ = interval(helpers.time('-|') * 20).pipe(take(1), share());

  return fakeCommands$.pipe(
    BuildService({
      buildCommand: 'yarn build',
      buildRetries: 2,
      buildBufferTime: 1,
    }),
    takeUntil(testSpan$),
  );
}

function testBuildOutput(input: BuildTestInput) {
  runScheduled((helpers) => {
    helpers
      .expectObservable(
        runBuildService(helpers, input).pipe(filter(isSpawnChunk)),
      )
      .toBe(input.printMarbles, outputChunks);
  });
}

function testBuildStates(input: BuildTestInput) {
  runScheduled((helpers) => {
    helpers
      .expectObservable(
        runBuildService(helpers, input).pipe(filter(isBuildState)),
      )
      .toBe(input.stateMarbles, {
        r: BuildState.Running,
        f: BuildState.Finished,
        e: BuildState.Failed,
      });
  });
}

function testBuildQueue(input: BuildTestInput) {
  runScheduled((helpers) => {
    helpers
      .expectObservable(
        runBuildService(helpers, input).pipe(
          filter(isQueueStatus),
          filter((item) => item.length > 0),
        ),
      )
      .toBe(input.queueMarbles, input.payloads);
  });
}

function testBuildSpawns(input: BuildTestInput) {
  runScheduled((helpers) => {
    const testSpan$ = interval(helpers.time('-|') * 20).pipe(take(1), share());
    const spawns$ = ShellMock.execs$.pipe(share());
    runBuildService(helpers, input).subscribe();
    helpers.expectObservable(spawns$.pipe(takeUntil(testSpan$))).toBe(
      input.spawnMarbles,
      mapValues(input.payloads, (v) => ({ cmd: 'yarn build', payload: v })),
    );
  });
}

describe('BuilderService', () => {
  describe('No run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: '--------------------|',
      printMarbles: '--------------------|',
      stateMarbles: '--------------------|',
      queueMarbles: '--------------------|',
      spawnMarbles: '--------------------|',
      payloads: {},
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Single run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-------------------|',
      printMarbles: '-abcde--------------|',
      stateMarbles: '-r----f-------------|',
      queueMarbles: '--------------------|',
      spawnMarbles: '-x------------------|',
      payloads: {
        x: ['x'],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Subsequent runs', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x------x------------|',
      printMarbles: '-abcde-abcde--------|',
      stateMarbles: '-r----fr----f-------|',
      queueMarbles: '--------------------|',
      spawnMarbles: '-x-----x------------|',
      payloads: {
        x: ['x'],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Queued run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-x-----------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--y-----------------|',
      spawnMarbles: '-y----y-------------|',
      payloads: {
        y: [payloads.x],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Queued runs', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-x-y---------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--y-z---------------|',
      spawnMarbles: '-y----z-------------|',
      payloads: {
        y: [payloads.x],
        z: [payloads.x, payloads.y],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Buffered run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: '(xx)----------------|',
      printMarbles: '-abcde--------------|',
      stateMarbles: '-r----f-------------|',
      queueMarbles: '--------------------|',
      spawnMarbles: '-z------------------|',
      payloads: {
        z: [payloads.x, payloads.x],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });

  describe('Queued buffered run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-(xy)--------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--z-----------------|',
      spawnMarbles: '-y----z-------------|',
      payloads: {
        y: [payloads.x],
        z: [payloads.x, payloads.y],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
    test('Spawns', () => testBuildSpawns(input));
  });
});
