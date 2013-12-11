#!/usr/bin/env node

var commander = require('commander');

commander
  .version('0.0.1')
  .parse(process.argv);

console.log(commander.args);