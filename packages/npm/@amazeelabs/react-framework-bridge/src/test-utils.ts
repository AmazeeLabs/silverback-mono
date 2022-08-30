/* eslint-disable import/export */
import { cleanup, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach } from 'vitest';

// After React 18 upgrade, `userEvent.type(..., 'bar')` produces wrong number of
// events. So we type letter by letter.
export async function type(element: HTMLElement, text: string): Promise<void> {
  for (const letter of text.split('')) {
    await userEvent.type(element, letter);
  }
}

afterEach(() => {
  cleanup();
});

const customRender = (ui: React.ReactElement, options = {}) =>
  render(ui, {
    // wrap provider(s) here if needed
    wrapper: ({ children }) => children,
    ...options,
  });

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
// override render export
export { customRender as render };
