import { filter, interval, share, take, takeUntil } from 'rxjs';
import { RunHelpers } from 'rxjs/testing';

import { BuildService, BuildState, isBuildState, isQueueStatus } from './build';
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
  queuedEvents: Record<string, Array<any>>;
};

function runBuildService(helpers: RunHelpers, input: BuildTestInput) {
  ShellMock.add('yarn build', helpers.cold(input.buildMarbles, outputChunks));

  const fakeCommands$ = helpers.hot(input.eventMarbles, payloads);

  const testSpan$ = interval(helpers.time('-|') * 20).pipe(take(1), share());

  return BuildService(
    {
      buildCommand: 'yarn build',
      buildRetries: 2,
      buildBufferTime: 1,
    },
    fakeCommands$,
  ).pipe(takeUntil(testSpan$));
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
      .toBe(input.queueMarbles, input.queuedEvents);
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
      queuedEvents: {},
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Single run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-------------------|',
      printMarbles: '-abcde--------------|',
      stateMarbles: '-r----f-------------|',
      queueMarbles: '--------------------|',
      queuedEvents: {},
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Subsequent runs', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x------x------------|',
      printMarbles: '-abcde-abcde--------|',
      stateMarbles: '-r----fr----f-------|',
      queueMarbles: '--------------------|',
      queuedEvents: {},
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Queued run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-x-----------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--y-----------------|',
      queuedEvents: {
        y: [payloads.x],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Queued runs', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-x-y---------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--y-z---------------|',
      queuedEvents: {
        y: [payloads.x],
        z: [payloads.x, payloads.y],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Buffered run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: '(xx)----------------|',
      printMarbles: '-abcde--------------|',
      stateMarbles: '-r----f-------------|',
      queueMarbles: '--------------------|',
      queuedEvents: {
        y: [payloads.x],
        z: [payloads.x, payloads.y],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });

  describe('Buffered run', () => {
    const input: BuildTestInput = {
      buildMarbles: 'abcde|',
      eventMarbles: 'x-(xy)--------------|',
      printMarbles: '-abcdeabcde---------|',
      stateMarbles: '-r----(rf)-f--------|',
      queueMarbles: '--z-----------------|',
      queuedEvents: {
        z: [payloads.x, payloads.y],
      },
    };
    test('Output', () => testBuildOutput(input));
    test('Status', () => testBuildStates(input));
    test('Queue', () => testBuildQueue(input));
  });
});
