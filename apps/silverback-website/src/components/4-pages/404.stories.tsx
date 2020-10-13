import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import NotFound from './404';

export default {
  title: 'Pages/404',
  component: NotFound,
} as Meta;

export const Default: Story = () => <NotFound />;
