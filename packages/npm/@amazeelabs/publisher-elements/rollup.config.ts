import alias from '@rollup/plugin-alias';
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
