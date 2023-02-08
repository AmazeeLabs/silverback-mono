import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { isArray, isString } from 'lodash';
import { from, Observable, of, SubscriptionLike } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export function websocketUrl(path: string, url?: string) {
  const parsedUrl = url ? new URL(url) : window.location;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${parsedUrl.host}${path}`;
}

export class WebsocketElement<T> extends LitElement {
  private _observable?: Observable<T>;
  protected subscriptions: Array<SubscriptionLike> = [];

  @property() socket?: string | Array<T> | Observable<T>;
  @property({ attribute: true }) path?: string;
  @property({ attribute: true }) url?: string;

  @state() currentValue: T;

  constructor(initialValue: T) {
    super();
    this.socket = of(initialValue);
    this.currentValue = initialValue;
  }

  protected get observable(): Observable<T> {
    if (!this._observable) {
      if (this.path) {
        this._observable = webSocket(websocketUrl(this.path, this.url));
      } else if (isString(this.socket)) {
        this._observable = webSocket(this.socket);
      } else if (isArray(this.socket)) {
        this._observable = from(this.socket);
      } else {
        this._observable = this.socket as Observable<T>;
      }
    }
    return this._observable;
  }

  connectedCallback() {
    super.connectedCallback();
    this.subscriptions.push(
      this.observable.subscribe((value) => {
        this.currentValue = value;
      }),
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }
}
