import {
  catchError,
  concat,
  from,
  mergeMap,
  Observable,
  of,
  retry,
  share,
  startWith,
  switchMap,
} from 'rxjs';

import { spawn, SpawnChunk } from './spawn';

type GatewayConfig = {
  startCommand: string;
  cleanCommand: string;
  startRetries: number;
  readyPattern: RegExp;
};

export type GatewayCommands = 'start' | 'clean';

export enum GatewayState {
  Init,
  Starting,
  Cleaning,
  Ready,
  Error,
}

export function isGatewayState(value: any): value is GatewayState {
  return (
    typeof value === 'number' &&
    [
      GatewayState.Starting,
      GatewayState.Ready,
      GatewayState.Error,
      GatewayState.Cleaning,
    ].includes(value)
  );
}

type GatewayOutput = Observable<SpawnChunk | GatewayState>;

export function GatewayService(
  config: GatewayConfig,
  commands$: Observable<GatewayCommands>,
): GatewayOutput {
  const commands: { [Command in GatewayCommands]: GatewayOutput } = {
    start: spawn(config.startCommand).pipe(
      startWith(GatewayState.Starting),
      retry(config.startRetries),
    ),
    clean: concat(
      spawn(config.cleanCommand).pipe(startWith(GatewayState.Cleaning)),
      spawn(config.startCommand).pipe(
        startWith(GatewayState.Starting),
        retry(config.startRetries),
      ),
    ),
  };

  // Check if the output item signals the service to be ready.
  const isReady = (value: SpawnChunk | GatewayState) =>
    !isGatewayState(value) && config.readyPattern.test(value.chunk.toString());

  return commands$.pipe(
    // Whenever a new command comes in, kill the previous one and switch there.
    switchMap((cmd) =>
      commands[cmd].pipe(
        // Catch errors and emit them as "error" markers on the output stream,
        // so we can wait for a new command after it.
        catchError(() => of(GatewayState.Error)),
        // If this log signals the service to be "ready", inject a new state
        // marker after it.
        mergeMap((value) =>
          isReady(value) ? from([value, GatewayState.Ready]) : from([value]),
        ),
      ),
    ),
    share(),
  );
}
