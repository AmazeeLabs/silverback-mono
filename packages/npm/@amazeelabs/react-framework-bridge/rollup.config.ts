import common from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

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
    plugins: [resolve(), common(), typescript({ tsconfig: './tsconfig.json' })],
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
    plugins: [resolve(), typescript({ tsconfig: './tsconfig.json' })],
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
    plugins: [resolve(), typescript({ tsconfig: './tsconfig.json' })],
  },
];
