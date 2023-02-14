import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { of } from 'rxjs';

export default {
  title: 'Status',
} as Meta;

export const Starting: StoryObj<{ state: ApplicationState }> = {
  render: (args) => {
    return html` <publisher-status .socket=${of(args.state)} /> `;
  },
  args: { state: ApplicationState.Starting },
};

export const Running: StoryObj<{ state: ApplicationState }> = {
  ...Starting,
  args: { state: ApplicationState.Updating },
};

export const Finished: StoryObj<{ state: ApplicationState }> = {
  ...Starting,
  args: { state: ApplicationState.Ready },
};

export const Error: StoryObj<{ state: ApplicationState }> = {
  ...Starting,
  args: { state: ApplicationState.Error },
};

export const Fatal: StoryObj<{ state: ApplicationState }> = {
  ...Starting,
  args: { state: ApplicationState.Fatal },
};
