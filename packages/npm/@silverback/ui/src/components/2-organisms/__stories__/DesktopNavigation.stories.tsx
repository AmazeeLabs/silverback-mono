import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { DesktopNavigation, NavigationItems } from '../DesktopNavigation';

export default {
  title: 'Components/Organisms/DesktopNavigation',
  component: DesktopNavigation,
} as Meta;

const Template: Story<NavigationItems> = (args) => (
  <DesktopNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {
  items: [],
  children: [],
};
