import { filter, of, scan } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import type { StatusUpdate } from './server/logging';
import { BuildState, GatewayState } from './states';

const defaultStatus = {
  gateway: GatewayState.Init,
  builder: BuildState.Init,
  queue: [],
} as StatusUpdate;

export function createWebsocketUrl(path: string) {
  if (window) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.host}${path}`;
  }
  return null;
}

function createWebsocket() {
  const url = createWebsocketUrl('/___status/updates');
  if (!url) {
    return of(defaultStatus);
  }
  return webSocket<StatusUpdate>({
    url,
  });
}

export const updates$ = createWebsocket();

updates$
  .pipe(
    scan(
      (acc, value) => ({
        previousBuilder: value.builder,
        previousGateway: value.gateway,
        refresh:
          (value.builder !== acc.previousBuilder &&
            value.builder === BuildState.Finished) ||
          value.gateway !== acc.previousGateway,
      }),
      {
        previousBuilder: BuildState.Finished,
        previousGateway: GatewayState.Ready,
        refresh: false,
      },
    ),
    filter((item) => item.refresh),
  )
  .subscribe(() => {
    window.location.reload();
  });
