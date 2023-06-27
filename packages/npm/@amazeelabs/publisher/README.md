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
there is no configuration, access to all routes will be granted.

For local development environments, to override configuration and skip
authentication, use

```bash
PUBLISHER_SKIP_AUTHENTICATION=true
```

### OAuth2

Prerequisite: OAuth2 server, like
[Drupal](../../../../apps/silverback-drupal/README.md#authentication).

There are 2 methods: `Authorization Code` and `Resource Owner Password`. The
first one should be favoured in most cases. It will ask the user to grant access
to Publisher the first time then use the Drupal user login form for
authentication if needed (or just redirect if the user is already authenticated
in Drupal).

The second one can be used as a minimal implementation if the challenge is to be
exposed in the client / the backend is only accessible from the client and not
the end user.

#### Authorization Code

Add environment variables corresponding to the server: `OAUTH2_CLIENT_ID`,
`OAUTH2_CLIENT_SECRET`, `OAUTH2_TOKEN_PATH`, `OAUTH2_TOKEN_HOST`,
`OAUTH2_AUTHORIZE_PATH`, `OAUTH2_SESSION_SECRET`, `OAUTH2_ENVIRONMENT_TYPE`

- OAUTH2_SESSION_SECRET: used for encryption of tokens
- OAUTH2_ENVIRONMENT_TYPE: `development` or `production`, the latter uses secure
  cookies

```typescript
export default defineConfig({
  oAuth2: {
    clientId: process.env.OAUTH2_CLIENT_ID || 'publisher',
    clientSecret: process.env.OAUTH2_CLIENT_ID || 'publisher',
    scope: process.env.OAUTH2_SCOPE || 'publisher',
    tokenHost: process.env.OAUTH2_TOKEN_HOST || 'http://localhost:8888',
    tokenPath: process.env.OAUTH2_TOKEN_PATH || '/oauth/token',
    authorizePath:
      process.env.OAUTH2_AUTHORIZE_PATH ||
      '/oauth/authorize?response_type=code',
    sessionSecret: process.env.OAUTH2_SESSION_SECRET || 'banana',
    environmentType: process.env.OAUTH2_ENVIRONMENT_TYPE || 'development',
    grantType: OAuth2GrantTypes.AuthorizationCode,
  },
});
```

#### Resource Owner Password

Add environment variables corresponding to the server: `OAUTH2_CLIENT_ID`,
`OAUTH2_CLIENT_SECRET`, `OAUTH2_TOKEN_PATH`, `OAUTH2_TOKEN_HOST`

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
