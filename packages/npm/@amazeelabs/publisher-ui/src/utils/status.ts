import { ApplicationState } from '@amazeelabs/publisher-shared';
import { bind } from '@react-rxjs/core';
import { delayWhen, retryWhen, Subject, timer } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

const defaultStatus: ApplicationState | null = null;

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
    const dummySubject = new Subject<ApplicationState | null>();
    dummySubject.next(defaultStatus);
    return dummySubject;
  }
  return webSocket<ApplicationState | null>({
    url,
  });
}

export const updates$ = createWebsocket();

const [statusHook] = bind(
  updates$.pipe(
    retryWhen((errors) => errors.pipe(delayWhen(() => timer(5000)))),
  ),
  defaultStatus,
);

export const useStatus = statusHook;
