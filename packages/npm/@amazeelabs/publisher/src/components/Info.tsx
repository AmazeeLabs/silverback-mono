import '../../tailwind.build.css';

import { OrganismProps } from '@amazeelabs/react-framework-bridge';
import { Build } from '@prisma/client';
import { bind } from '@react-rxjs/core';
import clsx from 'clsx';
import React, { ComponentProps, useState } from 'react';
import { LazyLog } from 'react-lazylog';
import { ajax } from 'rxjs/ajax';
import { SpawnChunk } from 'rxjs-shell';

import { BuildState, GatewayState } from '../states';
import { createWebsocketUrl, useStatus } from '../utils/status';

const clean$ = ajax({
  url: '/___status/clean',
  method: 'POST',
});

const build$ = ajax({
  url: '/___status/build',
  method: 'POST',
});

function History({
  historyItems,
}: OrganismProps<{
  historyItems: Array<{
    id: number;
    startedAt: number;
    finishedAt: number;
    success: boolean;
    type: string;
  }>;
}>) {
  const [expanded, setExpanded] = useState<number>();
  return (
    <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
        <div className="overflow-hidden">
          <table className="min-w-full divide-y-2 divide-blue-900">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left font-semibold"
                >
                  Id
                </th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">
                  Type
                </th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left font-semibold">
                  Log
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-900 bg-white">
              {historyItems.map((item) => {
                const date = new Date();
                date.setTime(item.startedAt);
                return (
                  <>
                    <tr
                      key={item.id}
                      onClick={() => setExpanded(item.id)}
                      className={'cursor-pointer'}
                    >
                      <td className="whitespace-nowrap px-3 py-4">{item.id}</td>
                      <td className="whitespace-nowrap px-3 py-4 capitalize">
                        {item.type}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                        {date.toUTCString()},{' '}
                        {Math.round((item.finishedAt - item.startedAt) / 1000)}{' '}
                        sec{' '}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <span
                          className={clsx(
                            'inline-flex rounded-full px-2 text-sm leading-5 font-semibold',
                            {
                              'bg-green-100 text-green-500':
                                item.success == true,
                              'bg-red-100 text-red-500': item.success == false,
                            },
                          )}
                        >
                          {item.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="17"
                          height="17"
                          fill="currentColor"
                          className="ml-2.5 inline -mt-0.5"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fillRule="evenodd"
                            d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                          />
                        </svg>
                      </td>
                    </tr>
                    <tr className={'!border-0 p-0 m-0'}>
                      <td
                        colSpan={5}
                        className={'pre-container p-0 m-0 !border-0'}
                      >
                        {item.id === expanded ? (
                          <HistoryLogs id={item.id} />
                        ) : null}
                      </td>
                    </tr>
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
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
      className={'mb-3 button-primary'}
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
      className={'button-primary'}
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

function scrollToBuildHistory() {
  const target = document.getElementById('build-history');
  target?.scrollIntoView({ behavior: 'smooth' });
}

export default function Info({
  historyItems,
}: OrganismProps<{
  historyItems: ComponentProps<typeof History>['historyItems'];
}>) {
  const status = useStatus();
  const gatewaySocket = createWebsocketUrl('/___status/gateway/logs');
  const builderSocket = createWebsocketUrl('/___status/builder/logs');
  const [followGatewayLog, setFollowGatewayLog] = useState(true);
  const [followBuilderLog, setFollowBuilderLog] = useState(true);
  return (
    <div className={'md:m-4'}>
      <div className={'max-w-full bg-gray-900 pb-10'}>
        <div className={'bg-gray-200 pt-6 pb-[9.5rem]'}>
          <div className="flex justify-between max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14">
            <div>
              <CleanButton />
              <BuildButton />
            </div>
            <a
              onClick={scrollToBuildHistory}
              className={
                'shrink-0 font-alt text-yellow-500 text-sm font-bold uppercase cursor-pointer hover:text-white focus:text-white focus:outline-none transition'
              }
            >
              Build History
              <svg
                className="ml-2 inline -mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"
                />
              </svg>
            </a>
          </div>
        </div>
        <div
          className={
            'md:flex mb-8 px-4 md:px-6 lg:px-10 xl:px-14 max-w-screen-2xl mx-auto'
          }
        >
          <div
            className={
              'mr-4 w-full bg-white p-6 rounded-md -mt-[7.4rem] shadow-sm'
            }
          >
            <h2
              className={
                'font-alt text-2xl font-bold text-blue-500 uppercase mb-1'
              }
            >
              Initial Build
            </h2>
            <h3 className={'text-xl mb-6'}>
              Gateway: <GatewayStatus />{' '}
              {status.gateway === GatewayState.Ready ? (
                <a
                  href="/"
                  className={
                    'text-blue-500 shadow-[inset_0_-1px_0_0_rgba(96,131,155,1)]'
                  }
                >
                  Go to website
                </a>
              ) : (
                <span>Waiting for initialization</span>
              )}
            </h3>

            <div style={{ height: 500, marginTop: 30 }}>
              {gatewaySocket ? (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={followGatewayLog}
                      onChange={() => setFollowGatewayLog(!followGatewayLog)}
                    />{' '}
                    Follow log
                  </label>
                  <LazyLog
                    enableSearch={true}
                    follow={followGatewayLog}
                    websocket={true}
                    url={gatewaySocket}
                    selectableLines={true}
                  />
                </>
              ) : null}
            </div>
          </div>
          <div
            className={
              'ml-4 w-full bg-white p-6 rounded-md -mt-[7.4rem] shadow-sm'
            }
          >
            <h2
              className={
                'font-alt text-2xl font-bold text-blue-500 uppercase mb-1'
              }
            >
              Current Build
            </h2>
            <h3 className={'text-xl mb-6'}>
              <BuilderStatus />
            </h3>

            <div style={{ height: 500, marginTop: 30 }}>
              {builderSocket ? (
                <>
                  <label>
                    <input
                      type="checkbox"
                      checked={followBuilderLog}
                      onChange={() => setFollowBuilderLog(!followBuilderLog)}
                    />{' '}
                    Follow log
                  </label>
                  <LazyLog
                    enableSearch={true}
                    follow={followBuilderLog}
                    websocket={true}
                    url={builderSocket}
                    selectableLines={true}
                  />
                </>
              ) : (
                builderSocket
              )}
            </div>
          </div>
        </div>
        <div
          className={'px-4 md:px-6 lg:px-10 xl:px-14 max-w-screen-2xl mx-auto'}
        >
          <div
            className={'bg-white shadow-sm p-6 rounded-md pre-container'}
            id="build-history"
          >
            <h2
              className={
                'font-alt text-2xl font-bold mb-2 text-blue-500 uppercase'
              }
            >
              Build history
            </h2>
            <div>
              <History historyItems={historyItems} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
