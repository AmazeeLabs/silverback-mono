import { bind } from '@react-rxjs/core';
import React from 'react';
import { LazyLog } from 'react-lazylog';
import { filter, switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

import { BuildState } from '../server/build';
import { GatewayState } from '../server/gateway';
import { createWebsocketUrl, updates$, useStatus } from '../utils/status';

const clean$ = ajax({
  url: '/___status/clean',
  method: 'POST',
});

const build$ = ajax({
  url: '/___status/build',
  method: 'POST',
});

const historyRefreshSignal$ = updates$.pipe(
  filter(
    (item) =>
      [GatewayState.Ready, GatewayState.Error].includes(item.gateway) ||
      [BuildState.Finished, BuildState.Failed].includes(item.builder),
  ),
);

const historyCall$ = ajax.getJSON<
  Array<{
    id: number;
    startedAt: number;
    finishedAt: number;
    success: boolean;
  }>
>('/___status/history');

const history$ = historyRefreshSignal$.pipe(switchMap(() => historyCall$));

const [useHistory] = bind(history$, []);

function History() {
  const history = useHistory();
  return (
    <table>
      {history.map((item) => (
        <tr key={item.id}>
          <td>{item.id}</td>
        </tr>
      ))}
    </table>
  );
}

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
  const gatewaySocket = createWebsocketUrl('/___status/gateway/logs');
  const builderSocket = createWebsocketUrl('/___status/builder/logs');
  return (
    <div>
      <div style={{ display: 'flex' }}>
        <div style={{ marginRight: 10, width: '100%' }}>
          <h1>
            Gateway: <GatewayStatus />{' '}
            {status.gateway === GatewayState.Ready ? (
              <a href="/">Go to website</a>
            ) : (
              <span>Waiting for initialization</span>
            )}
          </h1>
          <CleanButton />
          <div style={{ height: 500, marginTop: 20 }}>
            {gatewaySocket ? (
              <LazyLog
                enableSearch={true}
                follow={true}
                websocket={true}
                url={gatewaySocket}
                selectableLines={true}
              />
            ) : null}
          </div>
        </div>
        <div style={{ width: '100%' }}>
          <h1>
            Current Build: <BuilderStatus />
          </h1>
          <BuildButton />
          <div style={{ height: 500, marginTop: 20 }}>
            {builderSocket ? (
              <LazyLog
                enableSearch={true}
                follow={true}
                websocket={true}
                url={builderSocket}
                selectableLines={true}
              />
            ) : (
              builderSocket
            )}
          </div>
        </div>
      </div>
      <h1>Build history</h1>
      <History />
    </div>
  );
}
