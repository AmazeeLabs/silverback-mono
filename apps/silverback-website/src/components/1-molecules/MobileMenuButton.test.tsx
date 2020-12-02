import MobileMenuButton from '@molecules/MobileMenuButton';
import { fireEvent, render } from '@testing-library/react';
import React from 'react';

describe('MobileMenuButton', () => {
  it('displays label and icon according to state', () => {
    const toggle = jest.fn();
    const { getByLabelText, rerender } = render(
      <MobileMenuButton open={false} toggle={toggle} />,
    );
    const openButton = getByLabelText('Open');
    expect(openButton).toMatchInlineSnapshot(`
      <button
        aria-label="Open"
        class="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M4 6h16M4 12h16M4 18h16"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </button>
    `);

    rerender(<MobileMenuButton open={true} toggle={toggle} />);
    const closeButton = getByLabelText('Close');
    expect(closeButton).toMatchInlineSnapshot(`
      <button
        aria-label="Close"
        class="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark"
      >
        <svg
          class="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M6 18L18 6M6 6l12 12"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
          />
        </svg>
      </button>
    `);
  });

  it('invokes the toggle hook on click', () => {
    const toggle = jest.fn();
    const { getByLabelText } = render(
      <MobileMenuButton open={false} toggle={toggle} />,
    );
    const button = getByLabelText('Open');
    fireEvent.click(button);
    expect(toggle).toHaveBeenCalledTimes(1);
  });
});
