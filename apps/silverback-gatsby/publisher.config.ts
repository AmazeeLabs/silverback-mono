import { defineConfig } from '@amazeelabs/publisher';

// AXXX Testing CI

export default defineConfig({
  mode: 'local',
  commands: {
    build: {
      command: 'pnpm build:gatsby',
      outputTimeout: 1000 * 60 * 10,
    },
    clean: 'pnpm clean',
    serve: {
      command: 'pnpm netlify dev --dir=public --port=7999',
      readyPattern: 'Server now ready',
      readyTimeout: 1000 * 60,
      port: 7999,
    },
    deploy: 'echo "Fake deployment done"',
  },
  databaseUrl: '/tmp/publisher.sqlite',
  publisherPort: 8000,
});
