import { Build } from '@prisma/client';
import { bind } from '@react-rxjs/core';
import React, { useState } from 'react';
import { LazyLog } from 'react-lazylog';
import { filter, switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { SpawnChunk } from 'rxjs-shell';

import { BuildState, GatewayState } from '../states';
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
    type: string;
  }>
>('/___status/history');

const history$ = historyRefreshSignal$.pipe(switchMap(() => historyCall$));

const [useHistory] = bind(history$, []);

function History() {
  const history = useHistory();
  const [expanded, setExpanded] = useState<number>();
  return (
    <div>
      {history.map((item) => {
        const date = new Date();
        date.setTime(item.startedAt);
        return (
          <div key={item.id}>
            <div onClick={() => setExpanded(item.id)}>
              <div>
                {item.id}, {item.type}, {date.toUTCString()} ,{' '}
                {Math.round((item.finishedAt - item.startedAt) / 1000)} sec,{' '}
                {item.success ? 'success' : 'failed'}
              </div>
              {item.id === expanded ? <HistoryLogs id={item.id} /> : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

const [useHistoryItem] = bind(
  (id: number) => ajax.getJSON<Build | undefined>(`/___status/history/${id}`),
  undefined,
);

function HistoryLogs(props: { id: number }) {
  const value = useHistoryItem(props.id);
  return (
    <div>
      <pre>
        {value
          ? (
              JSON.parse(value.logs) as Array<
                SpawnChunk & { timestamp: number }
              >
            )
              .map((item) => item.chunk)
              .join('\n')
          : ''}
      </pre>
    </div>
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
