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
};

function createWebsocket() {
  if (!window) {
    return of(defaultStatus);
  }
  const protocol = window.location.protocol === 'https' ? 'wss' : 'ws';
  const url = `${protocol}://${window.location.host}/___status/updates`;
  return webSocket<StatusUpdate>({
    url,
  });
}

const [statusHook] = bind(createWebsocket(), defaultStatus);

export const useStatus = statusHook;
