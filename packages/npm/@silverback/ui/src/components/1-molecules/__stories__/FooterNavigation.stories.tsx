import { Meta } from '@storybook/react/types-6-0';

import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { FooterNavigation } from '../FooterNavigation';

export default {
  title: 'Components/Molecules/FooterNavigation',
  component: FooterNavigation,
} as Meta;

export const Default = {
  args: {
    items: mockNavItems(3, false),
  },
};

export const WithChildren = {
  args: {
    items: mockNavItems(3, true),
  },
};
