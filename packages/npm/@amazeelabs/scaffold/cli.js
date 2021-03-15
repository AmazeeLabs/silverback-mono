#!/usr/bin/env node
require('esm')(module /*, options*/)('./dist').scaffold(process.cwd());
