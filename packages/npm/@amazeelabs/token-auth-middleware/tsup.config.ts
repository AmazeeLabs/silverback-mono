import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  bundle: true,
  format: ['esm'],
  dts: true,
  cjsInterop: true,
  outDir: 'build',
  loader: {
    '.css': 'text',
    '.html': 'text',
  },
});
