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
