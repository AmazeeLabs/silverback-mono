import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Meta, StoryObj } from '@storybook/react';

import Status from './Status';

export default {
  component: Status,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Init: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Starting,
  },
};
export const Error: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Error,
  },
};
export const Ready: StoryObj<typeof Status> = {
  args: {
    status: ApplicationState.Ready,
  },
};
