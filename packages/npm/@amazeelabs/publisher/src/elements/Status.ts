import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { distinctUntilChanged, map, Observable, of } from 'rxjs';

import {
  ApplicationState,
  BuildState,
  GatewayState,
  mapStatusUpdateToApplicationState,
  StatusUpdate,
} from '../states';
import { WebsocketElement } from './WebsocketElement';

export class StatusEvent extends CustomEvent<ApplicationState> {
  constructor(state: ApplicationState) {
    super('publisher-status', {
      detail: state,
      bubbles: true,
      composed: true,
    });
  }
}

export function statusEvents() {
  return function (
    updates$: Observable<StatusUpdate>,
  ): Observable<StatusEvent> {
    return updates$.pipe(
      map(({ gateway, builder }) => ({ gateway, builder })),
      distinctUntilChanged(),
      map(mapStatusUpdateToApplicationState),
      map((state) => new StatusEvent(state)),
    );
  };
}

@customElement('publisher-status')
export class Status extends WebsocketElement<StatusUpdate> {
  @state() status: ApplicationState = ApplicationState.Starting;
  path = '/___status/updates';
  @property({ type: String }) labelStarting: String = 'Starting ...';
  @property({ type: String }) labelReady: String = 'Up-to-date';
  @property({ type: String }) labelError: String = 'Error';
  @property({ type: String }) labelFatal: String = 'Fatal Error';
  @property({ type: String }) labelUpdating: String = 'Updating ...';

  constructor() {
    super({
      gateway: GatewayState.Init,
      builder: BuildState.Init,
      queue: [],
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(
      this.observable.pipe(statusEvents()).subscribe((event) => {
        this.status = event.detail;
        this.dispatchEvent(event);
      }),
    );
  }

  protected render() {
    const label = {
      [ApplicationState.Starting]: this.labelStarting,
      [ApplicationState.Updating]: this.labelUpdating,
      [ApplicationState.Error]: this.labelError,
      [ApplicationState.Fatal]: this.labelFatal,
      [ApplicationState.Ready]: this.labelReady,
    }[this.status];

    const icon = {
      [ApplicationState.Starting]: Processing,
      [ApplicationState.Updating]: Processing,
      [ApplicationState.Error]: Error,
      [ApplicationState.Fatal]: Error,
      [ApplicationState.Ready]: Done,
    }[this.status];

    return html` <style>
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        @-webkit-keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
        .icon {
          width: 1.25em;
          height: 1.25em;
          margin-right: 0.75em;
        }
        .wrapper {
          display: flex;
          align-items: center;
        }
        .transparent {
          opacity: 0.25;
        }
        .spinning {
          animation: spin 1s linear infinite;
          -webkit-animation: spin 1s linear infinite;
        }
      </style>
      <div class="wrapper">
        <div class="icon">${icon}</div>
        <div>${label}</div>
      </div>`;
  }
}

const Processing = html` <svg
  class="spinning icon"
  xmlns="http://www.w3.org/2000/svg"
  fill="none"
  viewBox="0 0 24 24"
>
  <circle
    class="transparent"
    cx="12"
    cy="12"
    r="10"
    stroke="currentColor"
    stroke-width="4"
  ></circle>
  <path
    class="opacity"
    fill="currentColor"
    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
  ></path>
</svg>`;

const Error = html`
  <svg
    class="icon"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
`;

const Done = html`
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
    />
  </svg>
`;
