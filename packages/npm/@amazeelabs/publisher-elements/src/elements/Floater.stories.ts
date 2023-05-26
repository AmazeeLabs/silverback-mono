import { ApplicationState } from '@amazeelabs/publisher-shared';
import { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import { delay, of } from 'rxjs';

export default {
  title: 'Floating Status',
} as Meta;

export const Starting: StoryObj<{ state: ApplicationState }> = {
  render: (args) =>
    html` <publisher-floater
      ><publisher-status .socket=${of(args.state).pipe(delay(200))}
    /></publisher-floater>`,
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
