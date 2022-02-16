import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react/types-6-0';
import { userEvent, within } from '@storybook/testing-library';
import React, { JSXElementConstructor } from 'react';

import { mockNavItems } from '../__mocks__/mockNavItems.mocks';
import { DesktopNavigation } from '../DesktopNavigation';

type playStoryType<T extends JSXElementConstructor<any>> = StoryObj<React.ComponentProps<T> &{wouldNavigate: () => void}>;

export default {
  title: 'Components/Molecules/DesktopNavigation',
  component: DesktopNavigation,
} as Meta;

export const Default: playStoryType<typeof DesktopNavigation> = {
  args: {
    items: mockNavItems(6, false),
  },
};

export const WithChildren: playStoryType<typeof DesktopNavigation>  = {
  args: {
    items: mockNavItems(6, true),
  },
  parameters: {
    axe: {
      skip: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const mainNavigation = within(
      await canvas.findByRole('navigation', {
        name: 'Main navigation',
      }),
    );
    const menuButton = await mainNavigation.findByRole('button', {
      name: /Link #1/,
    });
    await userEvent.click(menuButton);

    await userEvent.click(
      await within(menuButton.parentElement!).findByText('SubNavigation Link 1'),
    );
  },
};
