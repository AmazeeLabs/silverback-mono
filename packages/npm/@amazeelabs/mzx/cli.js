#!/usr/bin/env node
import { mzx } from './dist/index.js';

mzx(() => {
  import('zx/cli');
})
  .then(() => undefined)
  .catch(console.error);
