import { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
import React, { JSXElementConstructor } from 'react';

import { HeaderMocks } from '../__mocks__/Header.mocks';
import { Header } from '../Header';

type playStoryType<T extends JSXElementConstructor<any>> = StoryObj<React.ComponentProps<T> &{wouldNavigate: () => void}>;

export default {
  title: 'Components/Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Default: playStoryType<typeof Header> = {
  args: {navItems: HeaderMocks.navItems, LogoLink: HeaderMocks.LogoLink},
};
