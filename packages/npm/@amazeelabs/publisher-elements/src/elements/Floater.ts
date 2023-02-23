import clsx from 'clsx';
import { CSSResultArray, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import tailwind from '../../tailwind.build.css';
import { ApplicationState } from '../states';
import { StatusEvent } from './Status';

@customElement('publisher-floater')
export class Floater extends LitElement {
  static styles = [tailwind] as unknown as CSSResultArray;
  @state() state: ApplicationState = ApplicationState.Starting;

  protected render(): unknown {
    const style = clsx({
      'absolute bottom-4 left-4 shadow-xl px-2 py-1 rounded flex border-solid border items-center':
        true,
      'text-gray-600 border-gray-300 bg-gray-100':
        this.state === ApplicationState.Starting,
      'text-green-800 border-green-300 bg-green-100':
        this.state === ApplicationState.Ready,
      'text-orange-700 border-orange-300 bg-orange-100':
        this.state === ApplicationState.Error,
      'text-red-700 border-red-300 bg-red-100':
        this.state === ApplicationState.Fatal,
      'text-yellow-800 border-yellow-400 bg-yellow-100':
        this.state === ApplicationState.Updating,
    });
    return html`<div
      @publisher-status="${(event: StatusEvent) => {
        this.state = event.detail;
      }}"
      class="${style}"
    >
      <slot />
    </div>`;
  }
}
