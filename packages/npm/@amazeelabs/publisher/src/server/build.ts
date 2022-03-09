import { isArray, isNumber } from 'lodash-es';
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

import { BuildState } from '../states';
import { spawn, SpawnChunk } from './spawn';

export type BuildConfig = {
  buildCommand: string;
  buildRetries: number;
  buildBufferTime: number;
};

export const isBuildState: (value: any) => value is BuildState = isNumber;

export const isQueueStatus = isArray;

type BuildQueueItem<TEvent extends any> = {
  state: BuildState;
  queued: boolean;
  events: Array<TEvent>;
};

function BuildQueue<TEvent extends any>() {
  return function (
    events$: Observable<TEvent[] | BuildState>,
  ): Observable<BuildQueueItem<TEvent>> {
    return events$.pipe(
      // Buffer incoming events, to give editors that save simultaneously earlier
      // results.
      filter((value) => isBuildState(value) || value.length > 0),
      scan<TEvent[] | BuildState, BuildQueueItem<TEvent>>(
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
          events: [],
        },
      ),
    );
  };
}

function BuildRunner<TEvent extends any>(config: BuildConfig) {
  return function (queue$: Observable<BuildQueueItem<TEvent>>) {
    return queue$.pipe(
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
  };
}

function BuildQueueStatus<TEvent extends any>() {
  return function (queue$: Observable<BuildQueueItem<TEvent>>) {
    return queue$.pipe(
      filter((item) => item.queued),
      map((item) => item.events),
    );
  };
}

export type BuildOutput = BuildState | Array<any> | SpawnChunk;

export function BuildService<TEvent extends any>(config: BuildConfig) {
  return function (events$: Observable<TEvent>): Observable<BuildOutput> {
    const status$ = new Subject<BuildState>();

    const queue$ = events$.pipe(
      bufferTime(config.buildBufferTime),
      mergeWith(status$.pipe(distinctUntilChanged())),
      BuildQueue(),
      share(),
    );

    const output$ = queue$.pipe(BuildRunner(config), share());

    output$.pipe(filter(isBuildState)).subscribe(status$);

    return queue$.pipe(BuildQueueStatus(), mergeWith(output$));
  };
}
