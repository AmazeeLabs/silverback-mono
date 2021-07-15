import { action } from '@storybook/addon-actions';
import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { MobileMenuButton, MobileMenuButtonProps } from '../MobileMenuButton';

export default {
  title: 'Components/Molecules/MobileMenuButton',
  component: MobileMenuButton,
} as Meta;

const Template: Story<MobileMenuButtonProps> = (args) => (
  <MobileMenuButton {...args} />
);

export const Closed = Template.bind({});
Closed.args = {
  open: false,
  toggle: () => {action('Mobile menu button clicked')();},
};

export const Open = Template.bind({});
Open.args = {
  open: true,
  toggle: () => {action('Mobile menu button clicked')();},
};
