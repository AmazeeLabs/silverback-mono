import { CSSResultArray, html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { isArray, isString } from 'lodash-es';
import { from, Observable, of } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

import tailwind from '../../tailwind.build.css';
import { BuildState, GatewayState, StatusUpdate } from '../states';

@customElement('publisher-status')
export class PublisherStatus extends LitElement {
  static styles = [tailwind] as unknown as CSSResultArray;
  @property() socket: string | StatusUpdate | Observable<StatusUpdate> = of({
    builder: BuildState.Finished,
    gateway: GatewayState.Ready,
    queue: [],
  });

  @property({ attribute: false }) status: StatusUpdate = {
    builder: BuildState.Finished,
    gateway: GatewayState.Ready,
    queue: [],
  };

  protected get observable(): Observable<StatusUpdate> {
    if (this.socket instanceof Observable) {
      return this.socket;
    }
    if (isString(this.socket)) {
      return webSocket(this.socket);
    }
    if (isArray(this.socket)) {
      return from(this.socket);
    }
    return of(this.socket);
  }

  connectedCallback() {
    super.connectedCallback();
    this.observable.subscribe((value) => {
      this.status = value;
    });
  }

  protected render() {
    const label = {
      [BuildState.Init]: 'Initializing',
      [BuildState.Running]: 'Building',
      [BuildState.Failed]: 'Failed',
      [BuildState.Finished]: 'Finished',
    }[this.status.builder];
    const style = classMap({
      'text-gray-500': this.status.builder === BuildState.Init,
      'text-green-500': this.status.builder === BuildState.Finished,
      'text-red-500': this.status.builder === BuildState.Failed,
      'text-yellow-500': this.status.builder === BuildState.Running,
    });
    return html`<h1 class=${style}>${label}</h1>`;
  }
}
