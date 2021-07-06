import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { useMobileMenu } from "../../../utils";
import MobileMenuButton,{ MobileMenuButtonProps } from '../MobileMenuButton';


export default {
  title: 'Components/Molecules/MobileMenuButton',
  component: MobileMenuButton,
} as Meta;

const Template: Story<MobileMenuButtonProps> = (args) => (
  <MobileMenuButton {...args} />
);

export const Default = Template.bind({});
Default.args = {
  toggle: useMobileMenu,
};
