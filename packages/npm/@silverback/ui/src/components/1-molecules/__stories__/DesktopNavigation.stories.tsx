import { Meta } from '@storybook/react/types-6-0';

import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { DesktopNavigation } from '../DesktopNavigation';

export default {
  title: 'Components/Molecules/DesktopNavigation',
  component: DesktopNavigation,
} as Meta;

export const Default = {
  args: {
    items: mockNavItems(6, false),
  },
};

export const WithChildren = {
  args: {
    items: mockNavItems(6, true),
  },
};
