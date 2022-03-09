import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import litcss from 'rollup-plugin-lit-css';

export default [
  {
    input: `src/server.ts`,
    output: {
      file: `build/server.js`,
      format: 'cjs',
    },
    external: ['@prisma/client'],
    plugins: [
      json(),
      commonjs({
        ignoreDynamicRequires: true,
      }),
      esbuild(),
      resolve({ preferBuiltins: true }),
    ],
  },
  {
    input: `src/refresh.ts`,
    output: {
      file: `dist/refresh.js`,
      format: 'iife',
    },
    plugins: [litcss(), esbuild(), resolve()],
  },
  {
    input: `src/elements.ts`,
    output: {
      file: `dist/elements.js`,
      format: 'iife',
    },
    plugins: [litcss(), esbuild(), resolve()],
  },
];
