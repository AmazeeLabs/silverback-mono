import { Prisma } from '@prisma/client';

import { BuildOutput, BuildState } from './build';
import { runScheduled } from './helpers';
import { buildReport } from './history';

type HistoryTestInput = {
  outputMarbles: string;
  reportMarbles: string;
  outputPayload: { [key: string]: BuildOutput };
  reportPayload: { [key: string]: Prisma.BuildCreateInput };
  inputPayload: Array<any>;
};

function testHistory(input: HistoryTestInput) {
  runScheduled((helpers) => {
    const fakeOutput$ = helpers.hot(input.outputMarbles, input.outputPayload);
    helpers
      .expectObservable(fakeOutput$.pipe(buildReport()))
      .toBe(input.reportMarbles, input.reportPayload);
  });
}

describe('buildReport', () => {
  it('does nothing when nothing happens', () => {
    testHistory({
      outputMarbles: '--------------------|',
      reportMarbles: '--------------------|',
      outputPayload: {},
      reportPayload: {},
      inputPayload: [],
    });
  });

  it('creates a report from a regular build output', () => {
    testHistory({
      outputMarbles: '-(ri)abcf-----------|',
      reportMarbles: '--------x-----------|',
      inputPayload: [],
      outputPayload: {
        r: BuildState.Running,
        f: BuildState.Finished,
        a: { type: 'stdout', chunk: 'a' },
        b: { type: 'stdout', chunk: 'b' },
        c: { type: 'stdout', chunk: 'c' },
      },
      reportPayload: {
        x: {
          type: 'incremental',
          startedAt: 1,
          finishedAt: 8,
          success: true,
          logs: JSON.stringify([
            { type: 'stdout', chunk: 'a', timestamp: 5 },
            { type: 'stdout', chunk: 'b', timestamp: 6 },
            { type: 'stdout', chunk: 'c', timestamp: 7 },
          ]),
        },
      },
    });
  });

  it('creates a report from a failed build output', () => {
    testHistory({
      outputMarbles: '-(ri)abce-----------|',
      reportMarbles: '--------x-----------|',
      inputPayload: [],
      outputPayload: {
        r: BuildState.Running,
        f: BuildState.Finished,
        e: BuildState.Failed,
        a: { type: 'stdout', chunk: 'a' },
        b: { type: 'stdout', chunk: 'b' },
        c: { type: 'stdout', chunk: 'c' },
      },
      reportPayload: {
        x: {
          type: 'incremental',
          startedAt: 1,
          finishedAt: 8,
          success: false,
          logs: JSON.stringify([
            { type: 'stdout', chunk: 'a', timestamp: 5 },
            { type: 'stdout', chunk: 'b', timestamp: 6 },
            { type: 'stdout', chunk: 'c', timestamp: 7 },
          ]),
        },
      },
    });
  });
});
