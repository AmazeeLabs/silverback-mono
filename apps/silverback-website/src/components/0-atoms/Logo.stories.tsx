import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import Logo from './Logo';

export default {
  title: 'Atoms/Logo',
  component: Logo,
} as Meta;

export const Default: Story = () => <Logo />;
