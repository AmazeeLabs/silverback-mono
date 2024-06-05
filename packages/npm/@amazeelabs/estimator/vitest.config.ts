import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: './src/vitest.setup.ts',
    testTimeout: 10000,
  },
});
