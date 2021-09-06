import { Meta } from '@storybook/react';
import React from 'react';

import { HeaderMocks } from '../__mocks__/Header.mocks';
import { Header } from '../Header';

export default {
  title: 'Components/Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Default = {
  render: (args: React.ComponentProps<typeof Header>) => <Header {...HeaderMocks} {...args} />,
  args: {},
};
