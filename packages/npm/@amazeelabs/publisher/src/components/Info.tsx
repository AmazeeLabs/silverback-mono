import React from 'react';
import { LazyLog } from 'react-lazylog';
import { ajax } from 'rxjs/ajax';

import { BuildState } from '../server/build';
import { GatewayState } from '../server/gateway';
import { useStatus } from '../utils/status';

const clean$ = ajax({
  url: '/___status/clean',
  method: 'POST',
});

const build$ = ajax({
  url: '/___status/build',
  method: 'POST',
});

function CleanButton() {
  const status = useStatus();
  return (
    <button
      disabled={status.gateway === GatewayState.Cleaning}
      onClick={() => clean$.subscribe()}
    >
      Clean
    </button>
  );
}

function BuildButton() {
  const status = useStatus();
  return (
    <button
      disabled={status.gateway !== GatewayState.Ready}
      onClick={() => build$.subscribe()}
    >
      Start Build
    </button>
  );
}

export function GatewayStatus() {
  const labels: { [Property in GatewayState]: string } = {
    [GatewayState.Init]: 'Initializing',
    [GatewayState.Cleaning]: 'Cleaning',
    [GatewayState.Error]: 'Error',
    [GatewayState.Ready]: 'Ready',
    [GatewayState.Starting]: 'Starting',
  };
  return <span>{labels[useStatus().gateway]}</span>;
}

function BuilderStatus() {
  const status = useStatus();
  const labels: { [Property in BuildState]: string } = {
    [BuildState.Init]: 'Initializing',
    [BuildState.Running]: 'Running',
    [BuildState.Finished]: 'Finished',
    [BuildState.Failed]: 'Failed',
  };
  return (
    <span>
      {labels[status.builder]} ({status.queue.length} queued)
    </span>
  );
}

export default function Info() {
  const status = useStatus();
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ marginRight: 10, width: '100%' }}>
        <h1>
          Gateway: <GatewayStatus />
        </h1>
        <CleanButton />
        <div>
          {status.gateway === GatewayState.Ready ? (
            <a href="/">Go to website</a>
          ) : (
            <span>Waiting for initialization</span>
          )}
        </div>
        <div style={{ height: 500, marginTop: 20 }}>
          <LazyLog
            enableSearch={true}
            follow={true}
            websocket={true}
            url={'ws://localhost:3001/___status/gateway/logs'}
            selectableLines={true}
          />
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <h1>
          Current Build: <BuilderStatus />
        </h1>
        <BuildButton />
        <div style={{ height: 500, marginTop: 20 }}>
          <LazyLog
            enableSearch={true}
            follow={true}
            websocket={true}
            url={'ws://localhost:3001/___status/builder/logs'}
            selectableLines={true}
          />
        </div>
      </div>
    </div>
  );
}
