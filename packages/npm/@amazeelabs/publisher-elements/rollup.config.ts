import resolve from '@rollup/plugin-node-resolve';
import esbuild from 'rollup-plugin-esbuild';
import litcss from 'rollup-plugin-lit-css';

export default [
  {
    input: `src/elements.ts`,
    output: {
      file: `dist/elements.js`,
      format: 'iife',
    },
    plugins: [litcss(), esbuild(), resolve()],
  },
];
