import { Meta, Story } from '@storybook/react';
import React from 'react';

import { HeaderMocks } from '../__mocks__/Header.mocks';
import { Footer, FooterProps } from '../Footer';

export default {
  title: 'Components/Organisms/Footer',
  component: Footer,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

const Template: Story<FooterProps> = (args) => (
  <Footer {...HeaderMocks} {...args} />
);

export const Default = Template.bind({});
Default.args = {};
