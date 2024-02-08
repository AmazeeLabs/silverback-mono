import { bind } from '@react-rxjs/core';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

import Info from '../components/Info';
import { updates$ } from '../utils/status';

const historyCall$ = ajax.getJSON<
  Array<{
    id: number;
    startedAt: number;
    finishedAt: number;
    success: boolean;
    type: string;
  }>
>('/___status/history');

const history$ = updates$.pipe(switchMap(() => historyCall$));

const [useHistory] = bind(history$, []);

function InfoPage() {
  const history = useHistory();
  return <Info historyItems={history} />;
}

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  <React.StrictMode>
    <InfoPage />
  </React.StrictMode>,
);
