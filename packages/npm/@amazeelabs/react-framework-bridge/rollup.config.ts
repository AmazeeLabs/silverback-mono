import common from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';
import esbuild from 'rollup-plugin-esbuild';

import pkg from './package.json';

export default [
  {
    input: `src/index.tsx`,
    output: [
      {
        file: 'index.esm.js',
        format: 'esm',
      },
      {
        file: 'index.js',
        format: 'cjs',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
    ],
    plugins: [esbuild(), resolve(), common()],
  },
  {
    input: 'dts/index.d.ts',
    output: [{ file: 'index.d.ts' }],
    plugins: [dts()],
  },
  {
    input: `src/gatsby.tsx`,
    output: {
      file: 'gatsby.js',
      format: 'esm',
    },
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
    ],
    plugins: [esbuild(), resolve()],
  },
  {
    input: 'dts/gatsby.d.ts',
    output: [{ file: 'gatsby.d.ts' }],
    plugins: [dts()],
  },
  {
    input: `src/storybook.tsx`,
    output: [
      {
        file: 'storybook.js',
        format: 'esm',
      },
      {
        file: 'storybook.cjs.js',
        format: 'cjs',
      },
    ],
    external: [
      ...Object.keys(pkg.dependencies),
      ...Object.keys(pkg.peerDependencies),
    ],
    plugins: [esbuild(), resolve()],
  },
  {
    input: 'dts/storybook.d.ts',
    output: [{ file: 'storybook.d.ts' }],
    plugins: [dts()],
  },
];
