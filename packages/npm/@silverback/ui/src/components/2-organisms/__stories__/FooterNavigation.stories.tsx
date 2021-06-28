import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import FooterNavigation from '../FooterNavigation';

export default {
  title: 'Components/Organisms/FooterNavigation',
  component: FooterNavigation,
} as Meta;

const Template: Story = (args) => (
  <FooterNavigation {...args} />
);

export const Default = Template.bind({});
Default.args = {};
