#!/usr/bin/env node
const path = require('path');

require('esm')(module /*, options*/)('./dist').scaffold(
  path.resolve(__dirname, 'files'),
  process.cwd(),
);
