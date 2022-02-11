/**
 * @file Helper functions for tests.
 */
import { Observable, Subject } from 'rxjs';
import { RunHelpers, TestScheduler } from 'rxjs/testing';

import { SpawnChunk } from './spawn';

/**
 * Create a new SpawnChunk from a string.
 *
 * @param msg The message sent to stdout.
 */
export const stdoutChunk = (msg: string) =>
  ({ chunk: msg, type: 'stdout' } as SpawnChunk);

/**
 * Static registry of mocked shell commands.
 *
 * Maps a shell command (e.g. `yarn start`) to a output stream defined by the
 * test.
 */
export class ShellMock {
  /**
   * Registry of output streams.
   * @protected
   */
  protected static mocks: { [key: string]: Observable<SpawnChunk> } = {};

  /**
   * Observable shell executions that happened.
   */
  public static execs$: Subject<{
    cmd: string;
    payload: any;
  }> = new Subject();

  /**
   * Add a new shell mock.
   *
   * @param cmd The command to be mocked.
   * @param stream The mocked output stream.
   */
  public static add(cmd: string, stream: Observable<SpawnChunk>) {
    this.mocks[cmd] = stream;
  }

  /**
   * Create a shell mock observable.
   *
   * @param cmd The command to be executed.
   * @param payload The build payload that will be sent.
   */
  public static create(cmd: string, payload?: any) {
    return new Observable((subscriber) => {
      this.execs$.next({
        cmd,
        payload,
      });
      this.mocks[cmd].subscribe(subscriber);
    });
  }
}

/**
 * Run tests in a rxjs scheduler for marble testing.
 * https://rxjs.dev/guide/testing/marble-testing
 *
 * @param fn The actual test function.
 */
export function runScheduled(fn: (helpers: RunHelpers) => void) {
  new TestScheduler((actual, expected) => {
    expect(actual).toEqual(expected);
  }).run(fn);
}
