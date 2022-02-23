import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { filter, of, scan } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import style from './refresh.css';
import type { StatusUpdate } from './server/logging';
import { BuildState, GatewayState } from './states';

const defaultStatus = {
  gateway: GatewayState.Init,
  builder: BuildState.Init,
  queue: [],
} as StatusUpdate;

export function createWebsocketUrl(path: string) {
  if (window) {
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    return `${protocol}://${window.location.host}${path}`;
  }
  return null;
}

function createWebsocket() {
  const url = createWebsocketUrl('/___status/updates');
  if (!url) {
    return of(defaultStatus);
  }
  return webSocket<StatusUpdate>({
    url,
  });
}

export const updates$ = createWebsocket();

const refreshSignal$ = updates$.pipe(
  scan(
    (acc, value) => ({
      previousBuilder: value.builder,
      previousGateway: value.gateway,
      refresh:
        (value.builder !== acc.previousBuilder &&
          value.builder === BuildState.Finished) ||
        value.gateway !== acc.previousGateway,
    }),
    {
      previousBuilder: BuildState.Finished,
      previousGateway: GatewayState.Ready,
      refresh: false,
    },
  ),
  filter((item) => item.refresh),
);

@customElement('publisher-refresh')
// @ts-ignore
export class PublisherRefresh extends LitElement {
  @state() status: BuildState;
  @state() outdated: boolean;

  constructor() {
    super();
    this.outdated = false;
    this.status = BuildState.Init;
    refreshSignal$.subscribe(() => {
      this.outdated = true;
      window.location.reload();
    });
    updates$.subscribe((value) => {
      this.status = value.builder;
    });
  }

  static styles = style;

  protected render() {
    const label = {
      [BuildState.Init]: 'Initializing ...',
      [BuildState.Finished]: 'Up-to-date',
      [BuildState.Failed]: 'Failed',
      [BuildState.Running]: 'Building ...',
    }[this.status];

    const statusStyle = {
      [BuildState.Init]: 'init',
      [BuildState.Finished]: 'finished',
      [BuildState.Failed]: 'failed',
      [BuildState.Running]: 'running',
    }[this.status];

    return html`<div class="status ${statusStyle}">${label}</div>`;
  }
}
