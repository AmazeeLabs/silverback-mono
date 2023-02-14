# Publisher

## Installation

```
pnpm add @amazeelabs/publisher
```

Create `publisher.config.ts` file in the root of your project:

```ts
import { defineConfig } from '@amazeelabs/publisher';

export default defineConfig({
  // ...
});
```

## Usage

```
pnpm publisher --help
```

## Slack notifications

To be notified in case of failure.

### Mandatory environment variables

- Slack Webhook ([documentation](https://api.slack.com/messaging/webhooks))
  `PUBLISHER_SLACK_WEBHOOK="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"`
- Slack Channel `PUBLISHER_SLACK_CHANNEL="#project-ci-channel"`

### Optional environment variables

- Publisher url, without a trailing slash. Adds a link to the status page, to
  the notification message. `PUBLISHER_URL="https://build.project.com"`
- Project and Environment (Lagoon only). Adds `LAGOON_PROJECT` and
  `LAGOON_ENVIRONMENT` to the notification message.
