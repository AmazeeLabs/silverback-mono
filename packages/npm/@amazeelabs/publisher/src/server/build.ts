import { isArray, isNumber } from 'lodash';
import {
  bufferTime,
  catchError,
  concat,
  distinctUntilChanged,
  filter,
  map,
  mergeMap,
  mergeWith,
  Observable,
  of,
  retry,
  scan,
  share,
  Subject,
} from 'rxjs';

import { spawn } from './spawn';

export const DefaultBuildConfig = {
  buildCommand: 'yarn build',
  buildRetries: 3,
  buildBufferTime: 1000,
};

export type BuildConfig = typeof DefaultBuildConfig;

/**
 * The primary states a build can be in.
 */
export enum BuildState {
  Init,
  Running,
  Finished,
  Failed,
}

export const isBuildState = isNumber;

export const isQueueStatus = isArray;

export function BuildService<TEvent extends any>(
  config: BuildConfig,
  events$: Observable<TEvent>,
) {
  const status$ = new Subject<BuildState>();

  const queue$ = events$.pipe(
    // Buffer incoming events, to give editors that save simultaneously earlier
    // results.
    bufferTime(config.buildBufferTime),
    filter((events) => events.length > 0),
    mergeWith(status$.pipe(distinctUntilChanged())),
    scan(
      (acc, value) =>
        isBuildState(value)
          ? {
              ...acc,
              // Clear events after moving into Running state.
              events: value === BuildState.Running ? [] : acc.events,
              // Move into queued state when moving into running.
              queued: value === BuildState.Running,
              // Store the new state value.
              state: value,
            }
          : {
              ...acc,
              // Simply append the new events.
              events: [...acc.events, ...value],
            },
      {
        state: BuildState.Finished,
        queued: false,
        events: [] as Array<TEvent>,
      },
    ),
    share(),
  );

  const output$ = queue$.pipe(
    filter((item) => !item.queued && item.events.length > 0),
    mergeMap((ev) =>
      concat(
        of(BuildState.Running),
        spawn(config.buildCommand, ev.events),
        of(BuildState.Finished),
      ),
    ),
    retry(config.buildRetries),
    catchError(() => of(BuildState.Failed)),
  );

  output$.pipe(filter(isBuildState)).subscribe(status$);

  return output$.pipe(
    mergeWith(
      queue$.pipe(
        filter((item) => item.queued),
        map((item) => item.events),
      ),
    ),
    share(),
  );
}
