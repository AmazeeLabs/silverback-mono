import { negate } from 'lodash';
import {
  combineLatestWith,
  filter,
  Observable,
  scan,
  shareReplay,
  startWith,
} from 'rxjs';

import { BuildService, BuildState, isQueueStatus } from './build';
import { GatewayService, GatewayState, isGatewayState } from './gateway';
import { isSpawnChunk } from './spawn';

export type StatusUpdate = {
  builder: BuildState;
  gateway: GatewayState;
  queue: Array<any>;
};

export function statusUpdates(
  gateway$: ReturnType<typeof GatewayService>,
  builder$: ReturnType<typeof BuildService>,
): Observable<StatusUpdate> {
  return gateway$.pipe(
    filter(isGatewayState),
    combineLatestWith(
      builder$.pipe(filter(negate(isSpawnChunk)), startWith(BuildState.Init)),
    ),
    scan(
      (acc, [gateway, builder]) => {
        return isQueueStatus(builder)
          ? {
              ...acc,
              gateway,
              queue: builder,
            }
          : {
              ...acc,
              gateway,
              builder,
            };
      },
      {
        builder: BuildState.Finished,
        gateway: GatewayState.Starting,
        queue: [] as Array<any>,
      },
    ),
    shareReplay(1),
  );
}
