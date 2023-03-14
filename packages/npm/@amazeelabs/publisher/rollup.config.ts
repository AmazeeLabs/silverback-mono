import { defineConfig } from 'rollup';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';
import shebang from 'rollup-plugin-preserve-shebang';

export default defineConfig([
  {
    input: 'src/cli.ts',
    output: {
      file: 'dist/cli.js',
    },
    plugins: [esbuild(), shebang()],
  },
  {
    input: 'src/exports.ts',
    output: {
      file: 'dist/exports.cjs',
      format: 'cjs',
    },
    plugins: [esbuild()],
  },
  {
    input: './src/exports.ts',
    output: [{ file: 'dist/exports.d.ts', format: 'es' }],
    plugins: [dts()],
  },
]);
