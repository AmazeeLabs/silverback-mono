#!/usr/bin/env node
import { mzx } from './dist/index.js';

mzx()
  .then((content) => {
    process.argv = [...process.argv.slice(0, 2), '--install', '-e', content];
    return import('zx/cli');
  })
  .catch((err) => {
    throw err;
  });
