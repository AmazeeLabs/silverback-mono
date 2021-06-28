import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import MobileNavigation from '../MobileNavigation';

export default {
  title: 'Components/Organisms/MobileNavigation',
  component: MobileNavigation,
} as Meta;

const Template: Story = (args) => (
  <MobileNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {};
