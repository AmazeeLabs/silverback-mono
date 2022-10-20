#!/usr/bin/env node
import { helpers, mzx } from './dist/index.js';

mzx(() => {
  Object.assign(global, helpers);
  import('zx/cli');
})
  .then(() => undefined)
  .catch(console.error);
