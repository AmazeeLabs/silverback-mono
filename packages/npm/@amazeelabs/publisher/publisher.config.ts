import type { PublisherConfig } from './src/core/tools/config';

// Do not use the exported `defineConfig` here, as internal imports break
// ts-import process.
const defineConfig = (config: PublisherConfig): PublisherConfig => config;

// Config for testing.

export default defineConfig({
  gatewayPort: 3000,
  commands: {
    clean:
      'echo "clean starting"; sleep 1; echo "cleaned 50%"; sleep 1; echo "clean done"',
    build:
      'echo "build starting"; sleep 1; echo "built 50%"; sleep 1; echo "build done"',
    deploy:
      'echo "deploy starting"; sleep 1; echo "deployed 50%"; sleep 1; echo "deploy done"',
    serve: {
      command: 'echo "serve started"; while true; do sleep 86400; done',
      readyPattern: 'serve started',
      readyTimeout: 1000,
      port: 3001,
    },
  },
  databaseUrl: './test/database.sqlite',
  persistentBuilds: {
    buildPaths: ['./test/build-public', './test/build-cache'],
    saveTo: './test/persisted-store',
  },
});
