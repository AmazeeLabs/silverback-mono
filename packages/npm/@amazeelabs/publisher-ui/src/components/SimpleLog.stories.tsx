import { Meta, StoryObj } from '@storybook/react';
import React from 'react';

import SimpleLog from './SimpleLog';

export default {
  component: SimpleLog,
  decorators: [
    (Story) => (
      <div style={{ height: '160px' }}>
        <Story />
      </div>
    ),
  ],
} as Meta;

export const Default: StoryObj<typeof SimpleLog> = {
  args: {
    url: '__storybook__',
  },
};
