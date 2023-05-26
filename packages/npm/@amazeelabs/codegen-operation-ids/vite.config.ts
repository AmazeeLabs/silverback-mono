/// <reference types="vitest" />

import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    deps: {
      inline:
        // TODO: Replace with true once https://github.com/vitest-dev/vitest/issues/2806 is fixed.
        [/^(?!.*vitest).*$/],
    },
  },
  define: {
    'import.meta.vitest': 'undefined',
  },
  build: {
    rollupOptions: {
      external: [
        ...builtinModules,
        'graphql',
        '@graphql-codegen/plugin-helpers',
        '@graphql-codegen/visitor-plugin-common',
      ],
    },
    lib: {
      entry: `src/index.ts`,
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
  },
});
