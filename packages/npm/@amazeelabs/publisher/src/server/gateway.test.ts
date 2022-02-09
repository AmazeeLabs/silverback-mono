import { negate } from 'lodash';
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

import {
  GatewayCommands,
  GatewayService,
  GatewayState,
  isGatewayState,
} from './gateway';
import { runScheduled, ShellMock, stdoutChunk } from './helpers';

jest.mock('./spawn');

describe('GatewayService', () => {
  const def = {
    startRetries: 1,
    startCommand: 'yarn start',
    cleanCommand: 'yarn clean',
    readyPattern: /startup step 3/,
    start: 'abc|',
    clean: 'efg|',
  };
  describe.each([['output'], ['status']])('%s', (test) => {
    it.each([
      {
        ...def,
        title: 'No input',
        events: '--------------------|',
        output: '--------------------|',
        status: '--------------------|',
      },
      {
        ...def,
        title: 'Immediate start',
        events: 's-------------------|',
        output: 'abcsssssssssssssssss|',
        status: 's-r-----------------|',
      },
      {
        ...def,
        title: 'Delayed start',
        events: '---s----------------|',
        output: '---abcssssssssssssss|',
        status: '---s-r--------------|',
      },
      {
        ...def,
        title: 'Double start',
        events: 'ss------------------|',
        output: 'aabcssssssssssssssss|',
        status: 'ss-r----------------|',
      },
      {
        ...def,
        title: 'Initial clean',
        events: 'c-------------------|',
        output: 'efgabcssssssssssssss|',
        status: 'c--s-r--------------|',
      },
      {
        ...def,
        title: 'Clean during startup',
        events: 'sc------------------|',
        output: 'aefgabcsssssssssssss|',
        status: 'sc--s-r-------------|',
      },
      {
        ...def,
        title: 'Clean during serve',
        events: 's---c---------------|',
        output: 'abcsefgabcssssssssss|',
        status: 's-r-c--s-r----------|',
      },
      {
        ...def,
        title: 'Restart after error',
        start: 'ab#',
        events: 's-------------------|',
        output: 'abab----------------|',
        status: 's-s-e---------------|',
      },
      {
        ...def,
        title: 'Manual restart after error',
        start: 'ab#',
        events: 's------s------s-----|',
        output: 'abab---abab---abab--|',
        status: 's-s-e--s-s-e--s-s-e-|',
      },
    ])(
      '$title',
      ({
        events,
        start,
        output,
        status,
        clean,
        readyPattern,
        startRetries,
        startCommand,
        cleanCommand,
      }) => {
        runScheduled(({ expectObservable, time, cold, hot }) => {
          const values = {
            s: stdoutChunk('serving'),
            a: stdoutChunk('startup step 1'),
            b: stdoutChunk('startup step 2'),
            c: stdoutChunk('startup step 3'),
            e: stdoutChunk('clean step 1'),
            f: stdoutChunk('clean step 2'),
            g: stdoutChunk('clean step 3'),
          };

          const t = time('-|');

          ShellMock.add(
            startCommand,
            concat(
              cold(start, values),
              /#$/.test(start)
                ? EMPTY
                : interval(t).pipe(
                    map(() => values.s),
                    startWith(values.s),
                  ),
            ),
          );
          ShellMock.add(cleanCommand, cold(clean, values));

          const fakeCommands$ = hot<GatewayCommands>(events, {
            s: 'start',
            c: 'clean',
          });

          const output$ = GatewayService(
            {
              cleanCommand,
              startCommand,
              startRetries,
              readyPattern,
            },
            fakeCommands$,
          );

          const testSpan$ = interval(t * 20).pipe(take(1), share());

          if (test === 'output') {
            expectObservable(
              output$
                .pipe(takeUntil(testSpan$))
                .pipe(filter(negate(isGatewayState))),
            ).toBe(output, values);
          } else {
            expectObservable(
              output$.pipe(takeUntil(testSpan$)).pipe(filter(isGatewayState)),
            ).toBe(status, {
              s: GatewayState.Starting,
              r: GatewayState.Ready,
              c: GatewayState.Cleaning,
              e: GatewayState.Error,
              o: -1,
            });
          }
        });
      },
    );
  });
});
