import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';

export default {
  input: `src/server.ts`,
  output: {
    file: `build/server.js`,
    format: 'cjs',
  },
  plugins: [
    json(),
    commonjs({
      ignoreDynamicRequires: true,
    }),
    esbuild(),
    nodeResolve({ preferBuiltins: true }),
  ],
};
