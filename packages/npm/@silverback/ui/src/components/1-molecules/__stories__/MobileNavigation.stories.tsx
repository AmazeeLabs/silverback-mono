import { Meta } from '@storybook/react/types-6-0';

import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { MobileNavigation } from '../MobileNavigation';

export default {
  title: 'Components/Molecules/MobileNavigation',
  component: MobileNavigation,
} as Meta;

export const Default = {
  args: {
    items: mockNavItems(6, false),
  },
};

export const WithChildren = {
  args: {
    items: mockNavItems(3, true),
  },
};
