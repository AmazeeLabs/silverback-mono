#!/usr/bin/env node
require('esm')(module /*, options*/)('./dist').scaffold(
  __dirname,
  process.cwd(),
);
