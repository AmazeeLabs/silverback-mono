import userEvent from '@testing-library/user-event';

// After React 18 upgrade, `userEvent.type(..., 'bar')` produces wrong number of
// events. So we type letter by letter.
export async function type(element: HTMLElement, text: string): Promise<void> {
  for (const letter of text.split('')) {
    await userEvent.type(element, letter);
  }
}
