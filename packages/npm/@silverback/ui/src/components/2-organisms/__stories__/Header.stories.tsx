import { Meta } from '@storybook/react';
import { userEvent, within } from '@storybook/testing-library';
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

export const ExpandedMenu = {
  name: 'ExpandedMenu',
  render: (args: React.ComponentProps<typeof Header>) => <Header {...HeaderMocks} {...args} />,
  args: {},
  play: async ({ canvasElement, args }) => {
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
      await within(menuButton.parentElement!).findByRole('link', {
        name: /^go-to-link-sub-link$/,
      }),
    );

    await expect(args.wouldNavigate).toHaveBeenCalled();
  },
};
