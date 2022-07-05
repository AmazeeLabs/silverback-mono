import '../../tailwind.build.css';

import clsx from "clsx";
import React, {useEffect} from 'react';

import {GatewayState} from '../states';

export default function Status({gateway}: { gateway: GatewayState }) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (gateway === GatewayState.Ready && params.has('dest')) {
      window.location.href = params.get('dest') as string;
    }
  }, [gateway]);

  let inProgress: boolean | undefined;
  if (gateway === GatewayState.Init || gateway === GatewayState.Starting || gateway === GatewayState.Cleaning) {
    inProgress = true;
  }

  return (
    <div className={'p-4 h-screen'}>
      <div className={'bg-gray-900 w-full h-full flex items-center justify-center'}>
        <div
          className={'w-full mx-auto max-w-[90%] md:max-w-lg shadow-sm text-gray-200 bg-white'}>
          <div className={clsx('font-bold text-lg md:text-2xl px-6 text-center font-alt uppercase relative', {
            'pt-32 pb-16 md:pb-20': inProgress,
            'pt-36 pb-12 md:pb-16': !inProgress
          })}>
            {inProgress ? (
              <svg version="1.1" id="L9" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" viewBox="0 0 100 100"
                   enableBackground="new 0 0 0 0" className={'w-20 absolute left-8 right-0 top-7 mx-auto'}>
                <rect x="20" y="50" width="3" height="14" fill="#60839b">
                  <animateTransform attributeType="xml" attributeName="transform" type="translate"
                                    values="0 0; 0 20; 0 0"
                                    begin="0" dur="0.8s" repeatCount="indefinite"></animateTransform>
                </rect>
                <rect x="30" y="50" width="3" height="14" fill="#60839b">
                  <animateTransform attributeType="xml" attributeName="transform" type="translate"
                                    values="0 0; 0 20; 0 0"
                                    begin="0.2s" dur="0.8s" repeatCount="indefinite"></animateTransform>
                </rect>
                <rect x="40" y="50" width="3" height="14" fill="#60839b">
                  <animateTransform attributeType="xml" attributeName="transform" type="translate"
                                    values="0 0; 0 20; 0 0"
                                    begin="0.4s" dur="0.8s" repeatCount="indefinite"></animateTransform>
                </rect>
              </svg>
            ) : null}
            {gateway === GatewayState.Ready ? (
              <svg
                version="1.1"
                className="w-16 absolute inset-x-0 top-14 mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                xmlnsXlink="http://www.w3.org/1999/xlink"
                x="0px"
                y="0px"
                viewBox="0 0 37 37"
                xmlSpace="preserve"
              >
                <path
                  className="tick-circle"
                  style={{
                    fill: 'none',
                    stroke: '#349D7A',
                    strokeWidth: '1',
                    strokeLinejoin: 'round',
                    strokeMiterlimit: '10',
                  }}
                  d="M30.5,6.5L30.5,6.5c6.6,6.6,6.6,17.4,0,24l0,0c-6.6,6.6-17.4,6.6-24,0l0,0c-6.6-6.6-6.6-17.4,0-24l0,0C13.1-0.2,23.9-0.2,30.5,6.5z"
                />
                <polyline
                  className="tick-path"
                  style={{
                    fill: 'none',
                    stroke: '#349D7A',
                    strokeWidth: '1',
                    strokeLinejoin: 'round',
                    strokeMiterlimit: '10',
                  }}
                  points="11.6,20 15.9,24.2 26.4,13.8 "
                />
              </svg>
            ) : null}
            {gateway === GatewayState.Error ? (
              <svg className="-rotate-90 w-16 stroke-[1.5] absolute inset-x-0 top-12 mx-auto"
                   xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className="stroke-red-500 cross-circle" cx="26" cy="26" r="25" fill="none"/>
                <path className="stroke-red-500 cross-path" fill="none" d="M16,16 l20,20"/>
                <path className="stroke-red-500 cross-path" fill="none" d="M16,36 l20,-20"/>
              </svg>
            ) : null}
            {gateway === GatewayState.Init ? (<span>Initializing...</span>) : null}
            {gateway === GatewayState.Starting ? (<span>Starting...</span>) : null}
            {gateway === GatewayState.Cleaning ? (<span>Cleaning...</span>) : null}
            {gateway === GatewayState.Error ? (<span>Error!</span>) : null}
            {gateway === GatewayState.Ready ? (<span>Ready!</span>) : null}
          </div>
          <div className={clsx('w-full h-[3px] overflow-hidden',
            {
              'bg-yellow-500': inProgress,
              'bg-green-500': gateway === GatewayState.Ready,
              'bg-red-500': gateway === GatewayState.Error,
            }
          )}>
            {inProgress ? (
              <div className="h-[3px] bg-blue-500 animate-bounce">
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}