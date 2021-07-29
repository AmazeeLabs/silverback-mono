import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { LayoutDecorator } from '../../../.storybook/decorators';
import NotFound from '../404';

export default {
  title: 'Pages/404',
  component: NotFound,
  decorators: [LayoutDecorator],
} as Meta;

export const Default: Story = () => <NotFound />;
