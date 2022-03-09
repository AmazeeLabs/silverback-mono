import { negate } from 'lodash-es';
import {
  concat,
  EMPTY,
  filter,
  interval,
  map,
  share,
  startWith,
  take,
  takeUntil,
} from 'rxjs';
import { RunHelpers } from 'rxjs/testing';

import { GatewayState } from '../states';
import { GatewayCommands, GatewayService, isGatewayState } from './gateway';
import { runScheduled, ShellMock, stdoutChunk } from './helpers';

jest.mock('./spawn');

const outputChunks = {
  s: stdoutChunk('serving'),
  a: stdoutChunk('startup step 1'),
  b: stdoutChunk('startup step 2'),
  c: stdoutChunk('startup step 3'),
  e: stdoutChunk('clean step 1'),
  f: stdoutChunk('clean step 2'),
  g: stdoutChunk('clean step 3'),
};

type GatewayTestInput = {
  startMarbles: string;
  cleanMarbles: string;
  eventMarbles: string;
  printMarbles: string;
  stateMarbles: string;
  spawnMarbles: string;
};

function runGatewayService(helpers: RunHelpers, config: GatewayTestInput) {
  const t = helpers.time('-|');

  ShellMock.add(
    'yarn start',
    concat(
      helpers.cold(config.startMarbles, outputChunks),
      /#$/.test(config.startMarbles)
        ? EMPTY
        : interval(t).pipe(
            map(() => outputChunks.s),
            startWith(outputChunks.s),
          ),
    ),
  );
  ShellMock.add('yarn clean', helpers.cold(config.cleanMarbles, outputChunks));

  const fakeCommands$ = helpers.hot<GatewayCommands>(config.eventMarbles, {
    s: 'start',
    c: 'clean',
  });

  const testSpan$ = interval(t * 20).pipe(take(1), share());
  return fakeCommands$.pipe(
    GatewayService({
      startCommand: 'yarn start',
      cleanCommand: 'yarn clean',
      startRetries: 1,
      readyPattern: /startup step 3/,
    }),
    takeUntil(testSpan$),
  );
}

function testGatewayOutput(input: GatewayTestInput) {
  runScheduled((helpers) => {
    helpers
      .expectObservable(
        runGatewayService(helpers, input).pipe(filter(negate(isGatewayState))),
      )
      .toBe(input.printMarbles, outputChunks);
  });
}

function testGatewayStates(input: GatewayTestInput) {
  runScheduled((helpers) => {
    helpers
      .expectObservable(
        runGatewayService(helpers, input).pipe(filter(isGatewayState)),
      )
      .toBe(input.stateMarbles, {
        s: GatewayState.Starting,
        r: GatewayState.Ready,
        c: GatewayState.Cleaning,
        e: GatewayState.Error,
        o: -1,
      });
  });
}

function testGatewaySpawns(input: GatewayTestInput) {
  runScheduled((helpers) => {
    const testSpan$ = interval(helpers.time('-|') * 20).pipe(take(1), share());
    const spawns$ = ShellMock.execs$.pipe(share());
    runGatewayService(helpers, input).subscribe();
    helpers
      .expectObservable(spawns$.pipe(takeUntil(testSpan$)))
      .toBe(input.spawnMarbles, {
        s: {
          cmd: 'yarn start',
          payload: undefined,
        },
        c: {
          cmd: 'yarn clean',
          payload: undefined,
        },
      });
  });
}

describe('GatewayService', () => {
  describe('No input', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: '--------------------|',
      printMarbles: '--------------------|',
      stateMarbles: '--------------------|',
      spawnMarbles: '--------------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Immediate start', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: 's-------------------|',
      printMarbles: 'abcsssssssssssssssss|',
      stateMarbles: 's-r-----------------|',
      spawnMarbles: 's-------------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Delayed start', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: '---s----------------|',
      printMarbles: '---abcssssssssssssss|',
      stateMarbles: '---s-r--------------|',
      spawnMarbles: '---s----------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Double start', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: 'ss------------------|',
      printMarbles: 'aabcssssssssssssssss|',
      stateMarbles: 'ss-r----------------|',
      spawnMarbles: 'ss------------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Initial clean', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: 'c-------------------|',
      printMarbles: 'efgabcssssssssssssss|',
      stateMarbles: 'c--s-r--------------|',
      spawnMarbles: 'c--s----------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Clean during startup', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: 'sc------------------|',
      printMarbles: 'aefgabcsssssssssssss|',
      stateMarbles: 'sc--s-r-------------|',
      spawnMarbles: 'sc--s---------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Clean during serve', () => {
    const input: GatewayTestInput = {
      startMarbles: 'abc|',
      cleanMarbles: 'efg|',
      eventMarbles: 's---c---------------|',
      printMarbles: 'abcsefgabcssssssssss|',
      stateMarbles: 's-r-c--s-r----------|',
      spawnMarbles: 's---c--s------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Restart after error', () => {
    const input: GatewayTestInput = {
      startMarbles: 'ab#',
      cleanMarbles: 'efg|',
      eventMarbles: 's-------------------|',
      printMarbles: 'abab----------------|',
      stateMarbles: 's-s-e---------------|',
      spawnMarbles: 's-s-----------------|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });

  describe('Manual restart after error', () => {
    const input: GatewayTestInput = {
      startMarbles: 'ab#',
      cleanMarbles: 'efg|',
      eventMarbles: 's------s------s-----|',
      printMarbles: 'abab---abab---abab--|',
      stateMarbles: 's-s-e--s-s-e--s-s-e-|',
      spawnMarbles: 's-s----s-s----s-s---|',
    };
    test('Output', () => testGatewayOutput(input));
    test('States', () => testGatewayStates(input));
    test('Spawns', () => testGatewaySpawns(input));
  });
});
