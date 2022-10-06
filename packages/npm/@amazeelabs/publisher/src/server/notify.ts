import {
  IncomingWebhook,
  IncomingWebhookResult,
  IncomingWebhookSendError,
} from '@slack/webhook';

import { BuildState, GatewayState } from '../states';

const slackWebhookUrl: string = process.env.PUBLISHER_SLACK_WEBHOOK || '';
const slackChannel: string = process.env.PUBLISHER_SLACK_CHANNEL || '';
const slackWebhook = new IncomingWebhook(slackWebhookUrl);

const notify = async (
  text: string,
): Promise<IncomingWebhookResult | IncomingWebhookSendError | string> => {
  if (slackWebhookUrl === '' || slackChannel === '') {
    return 'Slack webhook and channel are not configured yet.';
  } else {
    return await slackWebhook.send({
      username: 'Publisher Bot',
      text: text,
      channel: slackChannel,
      icon_emoji: ':robot_face:',
    });
  }
};

export const gatewayStateNotify = (state: GatewayState): void => {
  if (state === GatewayState.Error) {
    notify('😱 Gateway error');
  }
};

export const buildStateNotify = (state: BuildState): void => {
  if (state === BuildState.Failed) {
    notify('😱 Build failed');
  }
};
