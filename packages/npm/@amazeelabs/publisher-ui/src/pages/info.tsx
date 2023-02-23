import {bind} from "@react-rxjs/core";
import React from 'react';
import ReactDOM from 'react-dom';
import {filter, switchMap} from "rxjs";
import {ajax} from "rxjs/ajax";

import Info from '../components/Info';
import {BuildState, GatewayState} from "../states";
import {updates$} from "../utils/status";

const historyRefreshSignal$ = updates$.pipe(
  filter(
    (item) =>
      [GatewayState.Ready, GatewayState.Error].includes(item.gateway) ||
      [BuildState.Finished, BuildState.Failed].includes(item.builder),
  ),
);

const historyCall$ = ajax.getJSON<Array<{
  id: number;
  startedAt: number;
  finishedAt: number;
  success: boolean;
  type: string;
}>>('/___status/history');

const history$ = historyRefreshSignal$.pipe(switchMap(() => historyCall$));

const [useHistory] = bind(history$, []);

function InfoPage() {
  const history = useHistory();
  return <Info  historyItems={history}/>;
}

ReactDOM.render(
  <React.StrictMode>
    <InfoPage />
  </React.StrictMode>,
  document.getElementById('root'),
);
