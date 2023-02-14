import { ApplicationState } from '@amazeelabs/publisher-shared';
import { OrganismStory } from '@amazeelabs/react-framework-bridge/storybook';
import { Meta } from '@storybook/react';

import Status from './Status';

export default {
  component: Status,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Init: OrganismStory<typeof Status> = {
  args: {
    status: null,
  },
};
export const Error: OrganismStory<typeof Status> = {
  args: {
    status: ApplicationState.Error,
  },
};
export const Ready: OrganismStory<typeof Status> = {
  args: {
    status: ApplicationState.Ready,
  },
};
