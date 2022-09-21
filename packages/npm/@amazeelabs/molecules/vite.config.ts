/// <reference types="vitest" />

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  plugins: [
    react({
      jsxRuntime: 'classic',
    }),
    dts(),
  ],
  build: {
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
        },
      },
    },
    lib: {
      entry: `src/index.ts`,
      fileName: 'index',
      formats: ['cjs', 'es'],
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
