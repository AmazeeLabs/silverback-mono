import { bind } from '@react-rxjs/core';
import { interval, of, Subject } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import { StatusUpdate } from '../server/logging';
import { BuildState, GatewayState } from '../states';

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
    const dummySubject = new Subject();
    dummySubject.next(defaultStatus);
    return dummySubject;
  }
  return webSocket<StatusUpdate>({
    url,
  });
}

export const updates$ = createWebsocket();
interval(3000).subscribe(() => updates$.next(defaultStatus));

const [statusHook] = bind(updates$, defaultStatus);

export const useStatus = statusHook;
