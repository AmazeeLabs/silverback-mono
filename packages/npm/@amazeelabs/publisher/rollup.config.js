import alias from '@rollup/plugin-alias';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import litcss from 'rollup-plugin-lit-css';

import packageJson from './package.json';

export default [
  {
    input: `src/server.ts`,
    output: {
      file: `build/server.js`,
      format: 'cjs',
    },
    external: Object.keys(packageJson.dependencies),
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
    input: `src/elements.ts`,
    output: {
      file: `dist/elements.js`,
      format: 'iife',
    },
    plugins: [
      alias({
        entries: [{ find: 'lodash', replacement: 'lodash-es' }],
      }),
      litcss(),
      esbuild(),
      resolve(),
    ],
  },
];
