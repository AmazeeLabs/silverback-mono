import { filter, interval, share, take, takeUntil } from 'rxjs';

import { BuildService, BuildState, isBuildState, isQueueStatus } from './build';
import { runScheduled, ShellMock, stdoutChunk } from './helpers';
import { isSpawnChunk } from './spawn';

jest.mock('./spawn');

describe('BuilderService', () => {
  describe.each(['output', 'status', 'payloads'])('%s', (test) => {
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
    const def = {
      build: 'abcde|',
      buildCommand: 'yarn build',
      buildRetries: 2,
      buildBufferTime: 1,
    };
    it.each([
      {
        ...def,
        title: 'No run',
        events: '--------------------|',
        output: '--------------------|',
        status: '--------------------|',
        queue: ' --------------------|',
        queuedEvents: {},
      },
      {
        ...def,
        title: 'Single run',
        events: 'x-------------------|',
        output: '-abcde--------------|',
        status: '-r----f-------------|',
        queue: ' --------------------|',
        queuedEvents: {},
      },
      {
        ...def,
        title: 'Subsequent runs',
        events: 'x------x------------|',
        output: '-abcde-abcde--------|',
        status: '-r----fr----f-------|',
        queue: ' --------------------|',
        queuedEvents: {},
      },
      {
        ...def,
        title: 'Queued run',
        events: 'x-x-----------------|',
        output: '-abcdeabcde---------|',
        status: '-r----(rf)-f--------|',
        queue: ' --y-----------------|',
        queuedEvents: {
          y: [payloads.x],
        },
      },
      {
        ...def,
        title: 'Queued runs',
        events: 'x-x-y---------------|',
        output: '-abcdeabcde---------|',
        status: '-r----(rf)-f--------|',
        queue: ' --y-z---------------|',
        queuedEvents: {
          y: [payloads.x],
          z: [payloads.x, payloads.y],
        },
      },
      {
        ...def,
        title: 'Buffered run',
        events: '(xx)----------------|',
        output: '-abcde--------------|',
        status: '-r----f-------------|',
        queue: ' --------------------|',
        queuedEvents: {
          y: [payloads.x],
          z: [payloads.x, payloads.y],
        },
      },
      {
        ...def,
        title: 'Queued buffered run',
        events: 'x-(xy)--------------|',
        output: '-abcdeabcde---------|',
        status: '-r----(rf)-f--------|',
        queue: ' --z-----------------|',
        queuedEvents: {
          z: [payloads.x, payloads.y],
        },
      },
    ])(
      '$title',
      ({
        events,
        buildCommand,
        build,
        buildRetries,
        output,
        status,
        buildBufferTime,
        queue,
        queuedEvents,
      }) => {
        runScheduled(({ expectObservable, time, cold, hot }) => {
          const t = time('-|');

          ShellMock.add(buildCommand, cold(build, outputChunks));

          const fakeCommands$ = hot(events, payloads);

          const testSpan$ = interval(t * 20).pipe(take(1), share());

          const output$ = BuildService(
            {
              buildCommand,
              buildRetries,
              buildBufferTime: buildBufferTime,
            },
            fakeCommands$,
          );

          if (test === 'output') {
            expectObservable(
              output$.pipe(takeUntil(testSpan$)).pipe(filter(isSpawnChunk)),
            ).toBe(output, outputChunks);
          } else if (test === 'queue') {
            expectObservable(
              output$.pipe(takeUntil(testSpan$)).pipe(filter(isQueueStatus)),
            ).toBe(queue, queuedEvents);
          } else {
            expectObservable(
              output$.pipe(takeUntil(testSpan$)).pipe(filter(isBuildState)),
            ).toBe(status, {
              r: BuildState.Running,
              f: BuildState.Finished,
              e: BuildState.Failed,
            });
          }
        });
      },
    );
  });
});
