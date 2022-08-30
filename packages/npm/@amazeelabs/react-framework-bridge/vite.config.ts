/// <reference types="vitest" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

// @ts-ignore
import pkg from './package.json';

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  build: {
    rollupOptions: {
      external: [
        ...Object.keys(pkg.peerDependencies),
        ...Object.keys(pkg.dependencies),
      ],
    },
    lib: {
      entry: `src/${process.env.ENTRYPOINT}.tsx`,
      fileName: process.env.ENTRYPOINT,
      formats: ['cjs', 'es'],
    },
    emptyOutDir: false,
  },
  plugins: [react(), dts()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test-setup.ts',
  },
});
