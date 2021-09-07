import { Meta, Story } from '@storybook/react/types-6-0';
import React from 'react';

import { Anchor as AnchorComponent } from '../Anchor';

export default {
  title: 'Atoms/Anchor',
} as Meta;

export const Anchor: Story = () => <AnchorComponent />;
