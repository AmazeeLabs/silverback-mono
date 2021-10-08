import { action } from '@storybook/addon-actions';
import React from 'react';

import { Link } from '../types';

export const buildLink = (url: string): Link => {
  return function MockLink({ className, children }) {
    return (
      <a
        href={url}
        onClick={(ev) => {
          ev.preventDefault();
          action('navigate to')(url);
        }}
        className={className}
      >
        {children}
      </a>
    );
  };
};
