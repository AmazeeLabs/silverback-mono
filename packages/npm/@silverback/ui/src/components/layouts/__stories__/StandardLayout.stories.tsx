import { Meta, Story } from '@storybook/react';
import React from 'react';

import { StandardLayout } from '../StandardLayout';

export default {
  title: 'Components/Layouts/Standard',
  component: StandardLayout,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Standard: Story = () => (
  <StandardLayout>
    <div className="border-2 border-gray-300 border-solid h-24" />
  </StandardLayout>
);
