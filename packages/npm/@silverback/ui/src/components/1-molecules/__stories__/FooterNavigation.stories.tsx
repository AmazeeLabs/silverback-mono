import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import type { NavigationItems } from '../../../types';
import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { FooterNavigation } from '../FooterNavigation';

export default {
  title: 'Components/Molecules/FooterNavigation',
  component: FooterNavigation,
} as Meta;

const Template: Story<NavigationItems> = (args) => (
  <FooterNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {
  items: mockNavItems(3, false),
};

export const WithChildren = Template.bind({});
WithChildren.args = {
  items: mockNavItems(3, true),
};
