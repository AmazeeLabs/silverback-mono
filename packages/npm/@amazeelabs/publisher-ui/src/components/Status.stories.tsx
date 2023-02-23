import {OrganismStory,} from '@amazeelabs/react-framework-bridge/storybook';
import {Meta} from '@storybook/react';

import {GatewayState} from "../states";
import Status from './Status';

export default {
  component: Status,
  parameters: {
    layout: 'fullscreen',
  },
} as Meta;

export const Init: OrganismStory<typeof Status> = {
  args: {
    gateway: GatewayState.Init
  },
};
export const Error: OrganismStory<typeof Status> = {
  args: {
    gateway: GatewayState.Error
  },
};
export const Ready: OrganismStory<typeof Status> = {
  args: {
    gateway: GatewayState.Ready
  },
};