
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import type { NavigationItems } from '../../../types';
import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { MobileNavigation } from '../MobileNavigation';

export default {
  title: 'Components/Molecules/MobileNavigation',
  component: MobileNavigation,
} as Meta;

const Template: Story<NavigationItems> = (args) => (
  <MobileNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {
  items: mockNavItems(6, false),
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  items: mockNavItems(3, true),
};
