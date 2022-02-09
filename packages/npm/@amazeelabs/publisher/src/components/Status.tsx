import React, { useEffect } from 'react';
import useWebSocket from 'react-use-websocket';

import { BuildState } from '../server/build';
import { GatewayState } from '../server/gateway';

function useStatus(): {
  builder: BuildState;
  gateway: GatewayState;
  queue: Array<any>;
} {
  const { lastMessage } = useWebSocket('ws://localhost:3001/___status/updates');
  return lastMessage
    ? JSON.parse(lastMessage.data)
    : {
        builder: BuildState.Init,
        gateway: GatewayState.Init,
        queue: [],
      };
}

export default function Status() {
  const { gateway } = useStatus();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (gateway === GatewayState.Ready && params.has('dest')) {
      window.location.href = params.get('dest') as string;
    }
  }, [gateway]);

  const labels: { [Property in GatewayState]: string } = {
    [GatewayState.Init]: 'Initializing',
    [GatewayState.Cleaning]: 'Cleaning',
    [GatewayState.Error]: 'Error',
    [GatewayState.Ready]: 'Ready',
    [GatewayState.Starting]: 'Starting',
  };
  return <div>{labels[gateway]}</div>;
}
