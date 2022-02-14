import colors from 'colors';
import {
  combineLatestWith,
  filter,
  map,
  Observable,
  scan,
  shareReplay,
  startWith,
} from 'rxjs';

import { BuildOutput, BuildState, isBuildState, isQueueStatus } from './build';
import { GatewayOutput, GatewayState, isGatewayState } from './gateway';
import { isSpawnChunk, SpawnChunk } from './spawn';

export type StatusUpdate = {
  builder: BuildState;
  gateway: GatewayState;
  queue: Array<any>;
};

/**
 * Aggregate output of Gateway- and BuildService into one stream of UI updates.
 *
 * @param gateway$
 * @param builder$
 */
export function statusUpdates(
  gateway$: Observable<GatewayOutput>,
  builder$: Observable<BuildOutput>,
): Observable<StatusUpdate> {
  return gateway$.pipe(
    filter(isGatewayState),
    combineLatestWith(
      builder$.pipe(filter(isBuildState), startWith(BuildState.Init)),
      builder$.pipe(filter(isQueueStatus), startWith([])),
    ),
    scan(
      (acc, [gateway, builder, queue]) => ({
        gateway,
        builder,
        queue,
      }),
      {
        builder: BuildState.Finished,
        gateway: GatewayState.Starting,
        queue: [] as Array<any>,
      },
    ),
    shareReplay(1),
  );
}

const formattedGatewayStatusLogs: { [key in GatewayState]: string } = {
  [GatewayState.Init]: colors.gray('⏲ Waiting for start signal.'),
  [GatewayState.Starting]: colors.blue('🚀 Gateway starting.'),
  [GatewayState.Ready]: colors.green('👍 Gateway ready.'),
  [GatewayState.Cleaning]: colors.magenta(
    '💣  Cleaning all caches and restarting application.',
  ),
  [GatewayState.Error]: colors.red('😱 Error while starting Gateway.'),
};

export function gatewayStatusLogs(
  gateway$: Observable<GatewayOutput>,
): Observable<SpawnChunk> {
  return gateway$.pipe(
    map((item) =>
      isGatewayState(item) ? { chunk: formattedGatewayStatusLogs[item] } : item,
    ),
    filter(isSpawnChunk),
    map((item) => ({
      ...item,
      chunk: item.type === 'stderr' ? colors.red(item.chunk) : item.chunk,
    })),
  );
}

const formattedBuildStatusLogs: { [key in BuildState]: string } = {
  [BuildState.Init]: colors.gray('⏲️ Waiting for first build.'),
  [BuildState.Running]: colors.blue('🏃‍ Build running.'),
  [BuildState.Failed]: colors.red('😱 Build failed.'),
  [BuildState.Finished]: colors.green('👍 Build finished'),
};

export function buildStatusLogs(
  builder$: Observable<BuildOutput>,
): Observable<SpawnChunk> {
  return builder$.pipe(
    map((item) =>
      isBuildState(item) ? { chunk: formattedBuildStatusLogs[item] } : item,
    ),
    map((item) =>
      isQueueStatus(item)
        ? { chunk: colors.cyan(`🧘 ${item.length} queued jobs.`) }
        : item,
    ),
    filter(isSpawnChunk),
  );
}
