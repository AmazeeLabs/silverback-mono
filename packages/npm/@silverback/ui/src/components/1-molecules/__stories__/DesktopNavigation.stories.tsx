import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import type { NavigationItems } from '../../../types';
import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { DesktopNavigation } from '../DesktopNavigation';

export default {
  title: 'Components/Molecules/DesktopNavigation',
  component: DesktopNavigation,
} as Meta;

const Template: Story<NavigationItems> = (args) => (
  <DesktopNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {
  items: mockNavItems(6, false),
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  items: mockNavItems(6, true),
};
