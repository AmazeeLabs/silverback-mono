import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/mock-cloudinary-register.ts', 'src/mock-cloudinary-worker.ts'],
  outDir: 'worker',
  format: ['iife'],
  legacyOutput: true,
});
