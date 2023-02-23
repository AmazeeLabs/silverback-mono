import { LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { Observable, of, SubscriptionLike } from 'rxjs';
import { webSocket } from 'rxjs/webSocket';

export function websocketUrl(path: string, url?: string) {
  const parsedUrl = url ? new URL(url) : window.location;
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
  return `${protocol}://${parsedUrl.host}${path}`;
}

export class WebsocketElement<T> extends LitElement {
  private _observable?: Observable<T>;
  protected subscriptions: Array<SubscriptionLike> = [];

  @property() socket?: Observable<T> | null;
  @property({ attribute: true }) path?: string;
  @property({ attribute: true }) url?: string;

  @state() currentValue: T;

  constructor(initialValue: T) {
    super();
    this.currentValue = initialValue;
  }

  protected get observable(): Observable<T> {
    if (!this._observable) {
      if (this.socket) {
        this._observable = this.socket;
      } else if (this.path) {
        this._observable = webSocket(websocketUrl(this.path, this.url));
      } else {
        this._observable = of(this.currentValue);
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
