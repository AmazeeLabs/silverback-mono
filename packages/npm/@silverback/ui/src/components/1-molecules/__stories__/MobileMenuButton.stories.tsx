import { action } from '@storybook/addon-actions';
import { Meta } from '@storybook/react/types-6-0';

import { MobileMenuButton } from '../MobileMenuButton';

export default {
  title: 'Components/Molecules/MobileMenuButton',
  component: MobileMenuButton,
} as Meta;

export const Closed = {
  args: {
    open: false,
    toggle: () => {
      action('Mobile menu button clicked')();
    },
  },
};

export const Open = {
  args: {
    open: true,
    toggle: () => {
      action('Mobile menu button clicked')();
    },
  },
};
