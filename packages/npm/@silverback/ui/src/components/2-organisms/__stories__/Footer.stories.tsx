import { Meta } from '@storybook/react';
import React from 'react';

import { HeaderMocks } from '../__mocks__/Header.mocks';
import { Footer } from '../Footer';

export default {
  title: 'Components/Organisms/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Default = {
  render: (args: React.ComponentProps<typeof Footer>) => <Footer {...HeaderMocks} {...args} />,
  args: {},
};
