/// <reference types="vitest" />

import { builtinModules } from 'module';
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    deps: {
      inline: true,
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
