import { ApplicationState } from '@amazeelabs/publisher-shared';
import { bind } from '@react-rxjs/core';
import React from 'react';
import ReactDOM from 'react-dom';
import { filter, switchMap } from 'rxjs';
import { ajax } from 'rxjs/ajax';

import Info from '../components/Info';
import { updates$ } from '../utils/status';

const historyRefreshSignal$ = updates$.pipe(
  filter(
    (item) =>
      item === ApplicationState.Ready || item === ApplicationState.Error,
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

function InfoPage() {
  const history = useHistory();
  return <Info historyItems={history} />;
}

ReactDOM.render(
  <React.StrictMode>
    <InfoPage />
  </React.StrictMode>,
  document.getElementById('root'),
);
