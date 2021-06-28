import React from 'react';

export type MobileMenuButtonProps = {
  open: boolean;
  toggle?: () => void;
};

const MobileMenuButton: React.FC<MobileMenuButtonProps> = ({
  open,
  toggle,
  }) => (
    <button
      className="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark"
      aria-label={open ? 'Close' : 'Open'}
      onClick={toggle}
    >
      <svg
        className="w-6 h-6"
        stroke="currentColor"
        fill="none"
        viewBox="0 0 24 24"
      >
        {open ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
);

export default MobileMenuButton;
