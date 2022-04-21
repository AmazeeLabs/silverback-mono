import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { delay, of } from 'rxjs';

import { BuildState, GatewayState, StatusUpdate } from '../states';

export default {
  title: 'Floating Status',
} as Meta;

export const Starting: StoryObj<StatusUpdate> = {
  render: (args) =>
    html` <publisher-floater
      ><publisher-status .socket=${of(args).pipe(delay(200))}
    /></publisher-floater>`,
  args: {
    gateway: GatewayState.Starting,
    builder: BuildState.Init,
    queue: [],
  },
};

export const Running: StoryObj<StatusUpdate> = {
  ...Starting,
  args: {
    gateway: GatewayState.Ready,
    builder: BuildState.Running,
    queue: [],
  },
};

export const Finished: StoryObj<StatusUpdate> = {
  ...Starting,
  args: {
    gateway: GatewayState.Ready,
    builder: BuildState.Finished,
    queue: [],
  },
};

export const Error: StoryObj<StatusUpdate> = {
  ...Starting,
  args: {
    gateway: GatewayState.Ready,
    builder: BuildState.Failed,
    queue: [],
  },
};

export const Fatal: StoryObj<StatusUpdate> = {
  ...Starting,
  args: {
    gateway: GatewayState.Error,
    builder: BuildState.Failed,
    queue: [],
  },
};
