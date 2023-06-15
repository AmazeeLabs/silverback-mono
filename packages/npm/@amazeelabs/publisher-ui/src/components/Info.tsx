import '../../tailwind.css';

import { ApplicationState, BuildModel } from '@amazeelabs/publisher-shared';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { bind } from '@react-rxjs/core';
import clsx from 'clsx';
import React, { ComponentProps, Fragment, useState } from 'react';
import { LazyLog } from 'react-lazylog';
import { ajax } from 'rxjs/ajax';

import { createWebsocketUrl, useStatus } from '../utils/status';
import Collapsible from './Collapsible';

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
}: {
  historyItems: Array<{
    id: number;
    startedAt: number;
    finishedAt: number;
    success: boolean;
    type: string;
  }>;
}) {
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

                const startedAtDate = date.setTime(item.startedAt);
                const convertedDate = new Date(startedAtDate).toLocaleString(
                  window.navigator.language,
                  {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    timeZoneName: 'short',
                  },
                );

                return (
                  <>
                    <Disclosure key={item.id}>
                      {({ open }) => (
                        <>
                          <tr>
                            <td className="whitespace-nowrap px-3 py-4">
                              {item.id}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4 capitalize">
                              {item.type}
                            </td>
                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 sm:pr-6">
                              {convertedDate},{' '}
                              {Math.round(
                                (item.finishedAt - item.startedAt) / 1000,
                              )}{' '}
                              sec{' '}
                            </td>
                            <td className="whitespace-nowrap px-3 py-4">
                              <span
                                className={clsx(
                                  'inline-flex rounded-full px-2 text-sm leading-5 font-semibold',
                                  {
                                    'bg-green-100 text-green-500':
                                      item.success == true,
                                    'bg-red-100 text-red-500':
                                      item.success == false,
                                  },
                                )}
                              >
                                {item.success ? 'Success' : 'Failed'}
                              </span>
                            </td>
                            <td className="whitespace-nowrap py-4">
                              <Disclosure.Button>
                                <div className={'px-3'}>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="17"
                                    height="17"
                                    fill="currentColor"
                                    className={clsx(
                                      'ml-2.5 inline -mt-0.5 cursor-pointer transition',
                                      {
                                        'rotate-180 transform': open,
                                      },
                                    )}
                                    viewBox="0 0 16 16"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                                    />
                                  </svg>
                                </div>
                              </Disclosure.Button>
                            </td>
                          </tr>
                          <tr className={'!border-0 p-0 m-0'}>
                            <td
                              colSpan={5}
                              className={'pre-container p-0 m-0 !border-0'}
                            >
                              <Collapsible
                                show={open}
                                delay={0}
                                fadeDuration={200}
                                scaleDuration={250}
                              >
                                <Disclosure.Panel>
                                  <HistoryLogs id={item.id} />
                                </Disclosure.Panel>
                              </Collapsible>
                            </td>
                          </tr>
                        </>
                      )}
                    </Disclosure>
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
  (id: number) =>
    ajax.getJSON<BuildModel | undefined>(`/___status/history/${id}`),
  undefined,
);

function HistoryLogs(props: { id: number }) {
  const value = useHistoryItem(props.id);
  return (
    <div>
      <pre>{value ? value.logs : 'Loading...'}</pre>
    </div>
  );
}

function CleanButton() {
  const [isOpen, setIsOpen] = useState(false);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <>
      <button className={'mb-3 button-secondary'} onClick={openModal}>
        Clean
      </button>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <p className="text-sm text-gray-500">
                    Please confirm that you definitely want to clean the build:
                  </p>

                  <div className="mt-4">
                    <button
                      type="button"
                      className="button-secondary !border-gray-200"
                      onClick={closeModal}
                    >
                      No, go back!
                    </button>
                    <button
                      className={'button-primary'}
                      onClick={() => clean$.subscribe()}
                    >
                      Yes, do it!
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

function BuildButton() {
  return (
    <button className={'button-primary'} onClick={() => build$.subscribe()}>
      Queue Build
    </button>
  );
}

export function AppStatus() {
  const labels: { [Property in ApplicationState]: string } = {
    [ApplicationState.Error]: 'Error',
    [ApplicationState.Ready]: 'Ready',
    [ApplicationState.Starting]: 'Starting',
    [ApplicationState.Fatal]: 'Fatal',
    [ApplicationState.Updating]: 'Updating',
  };
  const status = useStatus();
  return <span>Status: {status ? labels[status] : 'Unknown'}</span>;
}

function scrollToBuildHistory() {
  const target = document.getElementById('build-history');
  target?.scrollIntoView({ behavior: 'smooth' });
}

export default function Info({
  historyItems,
}: {
  historyItems: ComponentProps<typeof History>['historyItems'];
}) {
  const logsSocket = createWebsocketUrl('/___status/logs');
  const [followLog, setFollowLog] = useState(true);
  return (
    <div className={'md:m-4'}>
      <div className={'max-w-full bg-gray-900 pb-10'}>
        <div className={'bg-gray-200 pt-6 pb-[9.5rem]'}>
          <div className="flex justify-between max-w-screen-2xl mx-auto px-4 md:px-6 lg:px-10 xl:px-14">
            <div>
              <BuildButton />
              <CleanButton />
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
            'mb-8 px-4 md:px-6 lg:px-10 xl:px-14 max-w-screen-2xl mx-auto'
          }
        >
          <Disclosure defaultOpen>
            {({ open }) => (
              <>
                <div
                  className={
                    'w-full bg-white p-6 rounded-md -mt-[7.4rem] shadow-sm mb-8'
                  }
                >
                  <div className={'relative text-left w-full'}>
                    <h2
                      className={
                        'font-alt text-2xl font-bold text-blue-500 uppercase mb-1'
                      }
                    >
                      Logs
                    </h2>
                    <h3 className={'text-xl mb-2'}>
                      <AppStatus />
                    </h3>
                    <Disclosure.Button
                      className={'absolute -top-0.5 right-0 text-right'}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17"
                        height="17"
                        fill="currentColor"
                        className={clsx(
                          'ml-2.5 inline -mt-0.5 cursor-pointer transition',
                          {
                            'rotate-180 transform': open,
                          },
                        )}
                        viewBox="0 0 16 16"
                      >
                        <path
                          fillRule="evenodd"
                          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
                        />
                      </svg>
                    </Disclosure.Button>
                  </div>

                  <Collapsible
                    show={open}
                    delay={0}
                    fadeDuration={200}
                    scaleDuration={250}
                  >
                    <Disclosure.Panel className={'pb-8'}>
                      <div style={{ height: 500, marginTop: 5 }}>
                        {logsSocket ? (
                          <>
                            <div className={'flex justify-end'}>
                              <label className={'mb-3 inline-block'}>
                                <input
                                  type="checkbox"
                                  checked={followLog}
                                  onChange={() => setFollowLog(!followLog)}
                                />{' '}
                                Auto scroll
                              </label>
                            </div>
                            <LazyLog
                              enableSearch={true}
                              follow={followLog}
                              websocket={true}
                              url={logsSocket}
                              selectableLines={true}
                            />
                          </>
                        ) : null}
                      </div>
                    </Disclosure.Panel>
                  </Collapsible>
                </div>
              </>
            )}
          </Disclosure>
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
