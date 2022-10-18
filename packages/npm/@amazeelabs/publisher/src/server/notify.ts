import {
  IncomingWebhook,
  IncomingWebhookResult,
  IncomingWebhookSendError,
} from '@slack/webhook';

import { BuildState, GatewayState } from '../states';

const slackWebhookUrl: string = process.env.PUBLISHER_SLACK_WEBHOOK || '';
const slackChannel: string = process.env.PUBLISHER_SLACK_CHANNEL || '';
const slackWebhook = new IncomingWebhook(slackWebhookUrl);
const publisherUrl: string = process.env.PUBLISHER_URL || '';
const lagoonProject: string = process.env.LAGOON_PROJECT || '';
const lagoonEnvironment: string = process.env.LAGOON_ENVIRONMENT || '';

const processMessage = (notificationText: string) => {
  let result: string = notificationText;

  if (publisherUrl !== '') {
    const publisherStatusLink: string = `<${publisherUrl}/___status/|Status>`;
    result = `${result}. ${publisherStatusLink}`;
  }
  if (lagoonEnvironment !== '') {
    const formattedEnvironment: string = '`' + lagoonEnvironment + '`';
    result = `${formattedEnvironment} ${result}`;
  }
  if (lagoonProject !== '') {
    const formattedProject: string = `*[${lagoonProject}]*`;
    result = `${formattedProject} ${result}`;
  }

  return result;
};

const notify = async (
  notificationText: string,
): Promise<IncomingWebhookResult | IncomingWebhookSendError | string> => {
  if (slackWebhookUrl === '' || slackChannel === '') {
    return 'Slack webhook and channel are not configured yet.';
  } else {
    return await slackWebhook.send({
      username: 'Publisher Bot',
      text: processMessage(notificationText),
      channel: slackChannel,
      icon_emoji: ':robot_face:',
    });
  }
};

export const gatewayStateNotify = (state: GatewayState): void => {
  if (state === GatewayState.Error) {
    notify('🛑 Gateway error');
  }
};

export const buildStateNotify = (state: BuildState): void => {
  if (state === BuildState.Failed) {
    notify('😱 Build failed');
  }
};
