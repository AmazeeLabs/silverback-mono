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

## Authentication

Can be configured in `publisher.config.ts`

If several authentication methods are configured, OAuth2 will be favoured. If
there is no configuration, access to the routes will be granted.

### OAuth2

Prerequisite: OAuth2 server, like
[Drupal](../../../../apps/silverback-drupal/README.md#authentication).

Add environment variables corresponding to the server: `OAUTH2_CLIENT_ID`,
`OAUTH2_CLIENT_SECRET`, `OAUTH2_TOKEN_HOST`, `OAUTH2_TOKEN_PATH`

```typescript
export default defineConfig({
  oAuth2: {
    clientId: process.env.OAUTH2_CLIENT_ID || 'publisher',
    clientSecret: process.env.OAUTH2_CLIENT_SECRET || 'publisher',
    tokenHost: process.env.OAUTH2_TOKEN_HOST || 'http://localhost:8888',
    tokenPath: process.env.OAUTH2_TOKEN_PATH || '/oauth/token',
    grantType: OAuth2GrantTypes.ResourceOwnerPassword,
  },
});
```

### Basic Auth

```typescript
export default defineConfig({
  basicAuth: {
    username: process.env.BASIC_AUTH_USERNAME || 'publisher',
    password: process.env.BASIC_AUTH_PASSWORD || 'publisher',
  },
});
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
