import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import nodeResolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { RollupOptions } from 'rollup';

const config: RollupOptions = {
  input: 'src/index.ts',
  output: {
    file: 'index.js',
    format: 'cjs',
  },
  plugins: [nodeResolve(), typescript(), commonjs(), json()],
};

export default config;
