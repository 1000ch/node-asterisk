#!/usr/bin/env node

// external lib
var argv = require('optimist').argv;
var marked = require('marked');

// own lib
var file = require('../lib/file');

// target css files
var files = [];

// if argument is not specified
if (argv._.length === 0) {
  throw new Error('There is no argument.');
}

// if there is no css files
argv._.filter(function(path) {
  return file.exists(path);
}).forEach(function(path) {
  files.push(path);
});

if (files.length === 0) {
  throw new Error('No css file is specified.');
}