import { ApplicationState } from '@amazeelabs/publisher-shared';
import clsx from 'clsx';
import { css, html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

export class StatusEvent extends CustomEvent<ApplicationState> {
  constructor(state: ApplicationState) {
    super('publisher-status', {
      detail: state,
      bubbles: true,
      composed: true,
    });
  }
}

@customElement('publisher-floater')
export class Floater extends LitElement {
  static styles = styles();
  @state() state: ApplicationState = ApplicationState.Starting;

  protected render(): unknown {
    const style = clsx({
      base: true,
      gray: this.state === ApplicationState.Starting,
      green: this.state === ApplicationState.Ready,
      orange: this.state === ApplicationState.Error,
      red: this.state === ApplicationState.Fatal,
      yellow: this.state === ApplicationState.Updating,
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

function styles() {
  // TODO: Previously we used Tailwind. Later, we got rid of it (because it was
  //  costly to maintain when it is used with lit elements) and replaced it with
  //  custom styles. Which were just copied from Tailwind generated CSS.
  //  It would be cool if a true frontend developer clean them up.
  return css`
    .base {
      position: absolute;
      bottom: 1rem;
      left: 1rem;
      --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1),
        0 8px 10px -6px rgb(0 0 0 / 0.1);
      --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color),
        0 8px 10px -6px var(--tw-shadow-color);
      box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000),
        var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow);
      padding-left: 0.5rem;
      padding-right: 0.5rem;
      padding-top: 0.25rem;
      padding-bottom: 0.25rem;
      border-radius: 0.25rem;
      display: flex;
      border-style: solid;
      border-width: 1px;
      align-items: center;
    }

    .gray {
      --tw-text-opacity: 1;
      color: rgb(75 85 99 / var(--tw-text-opacity));
      --tw-border-opacity: 1;
      border-color: rgb(209 213 219 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(243 244 246 / var(--tw-bg-opacity));
    }

    .green {
      --tw-text-opacity: 1;
      color: rgb(22 101 52 / var(--tw-text-opacity));
      --tw-border-opacity: 1;
      border-color: rgb(134 239 172 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(235 251 246 / var(--tw-bg-opacity));
    }

    .orange {
      --tw-text-opacity: 1;
      color: rgb(194 65 12 / var(--tw-text-opacity));
      --tw-border-opacity: 1;
      border-color: rgb(253 186 116 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(255 237 213 / var(--tw-bg-opacity));
    }

    .red {
      --tw-text-opacity: 1;
      color: rgb(185 28 28 / var(--tw-text-opacity));
      --tw-border-opacity: 1;
      border-color: rgb(252 165 165 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(254 243 247 / var(--tw-bg-opacity));
    }

    .yellow {
      --tw-text-opacity: 1;
      color: rgb(133 77 14 / var(--tw-text-opacity));
      --tw-border-opacity: 1;
      border-color: rgb(255 230 105 / var(--tw-border-opacity));
      --tw-bg-opacity: 1;
      background-color: rgb(254 249 195 / var(--tw-bg-opacity));
    }

    /* Apply the TailwindCSS "html" reset to "host", since we have no "html" tag in a custom element. */
    :host {
      line-height: 1.5;
      -webkit-text-size-adjust: 100%;
      -moz-tab-size: 4;
      -o-tab-size: 4;
      tab-size: 4;
      font-family:
        ui-sans-serif,
        system-ui,
        -apple-system,
        BlinkMacSystemFont,
        'Segoe UI',
        Roboto,
        'Helvetica Neue',
        Arial,
        'Noto Sans',
        sans-serif,
        'Apple Color Emoji',
        'Segoe UI Emoji',
        'Segoe UI Symbol',
        'Noto Color Emoji';
    }
  `;
}
