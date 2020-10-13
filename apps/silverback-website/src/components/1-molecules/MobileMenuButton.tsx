import React from 'react';

const MobileMenuButton: React.FC<{
  open: boolean;
  toggle: () => void;
}> = ({ open, toggle }) => (
  <button
    className="inline-flex items-center justify-center p-2 rounded-md text-amazee-dark"
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
