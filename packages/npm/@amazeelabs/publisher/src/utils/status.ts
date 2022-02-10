import { bind } from '@react-rxjs/core';
import { webSocket } from 'rxjs/webSocket';

import { BuildState } from '../server/build';
import { GatewayState } from '../server/gateway';
import { StatusUpdate } from '../server/status';

const [statusHook] = bind(
  webSocket<StatusUpdate>({
    url: 'ws://localhost:3001/___status/updates',
  }),
  {
    gateway: GatewayState.Init,
    builder: BuildState.Init,
    queue: [],
  },
);

export const useStatus = statusHook;
