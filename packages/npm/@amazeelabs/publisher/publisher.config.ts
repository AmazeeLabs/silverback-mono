import type { PublisherConfig } from './src/tools/config';

// Do not use the exported `defineConfig` here, as internal imports break
// ts-import process.
const defineConfig = (config: PublisherConfig): PublisherConfig => config;

// Config for testing.

export default defineConfig({
  publisherPort: 3000,
  basicAuth: {
    username: 'test',
    password: 'test',
  },
  // When several authentication methods are configured,
  // oAuth2 takes precedence.
  oAuth2: {
    clientId: process.env.OAUTH2_CLIENT_ID || 'publisher',
    clientSecret: process.env.OAUTH2_CLIENT_SECRET || 'publisher',
    // Applies for ResourceOwnerPassword only.
    scope: process.env.OAUTH2_SCOPE || 'publisher',
    tokenHost: process.env.OAUTH2_TOKEN_HOST || 'http://127.0.0.1:8888',
    tokenPath: process.env.OAUTH2_TOKEN_PATH || '/oauth/token',
    authorizePath:
      process.env.OAUTH2_AUTHORIZE_PATH ||
      '/oauth/authorize?response_type=code',
    sessionSecret: process.env.OAUTH2_SESSION_SECRET || 'banana',
    environmentType: process.env.OAUTH2_ENVIRONMENT_TYPE || 'development',
    grantType: 0, // AuthorizationCode
  },
  mode: 'local',
  commands: {
    clean:
      'echo "clean starting"; sleep 1; echo "cleaned 50%"; sleep 1; echo "clean done"',
    build: {
      command:
        'echo "build starting"; sleep 1; echo "built 50%"; sleep 1; echo "build done"',
      outputTimeout: 5000,
    },
    deploy:
      'echo "deploy starting"; sleep 1; echo "deployed 50%"; sleep 1; echo "deploy done"',
    serve: {
      command: 'echo "serve started"; while true; do sleep 86400; done',
      readyPattern: 'serve started',
      port: 3001,
    },
  },
  databaseUrl: './test/database.sqlite',
  responseHeaders: new Map()
    .set('X-Frame-Options', 'deny')
    .set('X-Content-Type-Options', 'nosniff')
    .set('Content-Security-Policy', "frame-ancestors 'none'"),
});
