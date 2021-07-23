import { Meta, Story } from '@storybook/react';
import React from 'react';

import { HeaderMocks } from '../__mocks__/Header.mocks';
import { Header, HeaderProps } from '../Header';

export default {
  title: 'Components/Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<HeaderProps> = (args) => (
  <Header {...HeaderMocks} {...args} />
);

export const Default = Template.bind({});
Default.args = {};
