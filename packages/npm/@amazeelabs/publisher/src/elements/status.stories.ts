import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';

import { BuildState, GatewayState, StatusUpdate } from '../states';

export default {
  title: 'Status',
} as Meta;

export const Initial: StoryObj<StatusUpdate> = {
  render: (args) => html`<publisher-status .socket=${args} />`,
  args: {
    queue: [],
    builder: BuildState.Init,
    gateway: GatewayState.Init,
  },
};

export const Running: StoryObj<StatusUpdate> = {
  ...Initial,
  args: {
    ...Initial.args,
    builder: BuildState.Running,
  },
};

export const Finished: StoryObj<StatusUpdate> = {
  ...Initial,
  args: {
    ...Initial.args,
    builder: BuildState.Finished,
  },
};

export const Failed: StoryObj<StatusUpdate> = {
  ...Initial,
  args: {
    ...Initial.args,
    builder: BuildState.Failed,
  },
};
