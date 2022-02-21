import { bind } from '@react-rxjs/core';
import { of } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { BuildState } from '../server/build';
import { GatewayState } from '../server/gateway';
import { StatusUpdate } from '../server/logging';

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

const [statusHook] = bind(updates$, defaultStatus);

export const useStatus = statusHook;
