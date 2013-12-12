#!/usr/bin/env node

// core
var fs = require('fs');
var path = require('path');

// external lib
var argv = require('optimist').argv;
var marked = require('marked');
var glob = require('glob');

// own lib
var file = require('../lib/file');

// set marked options
marked.setOptions({
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: true,
  smartLists: true,
  smartypants: false
});

// target css files
var targetFiles = [];

// if argument is not specified
if (argv._.length === 0) {
  throw new Error('There is no argument.');
}

// if there is no css files
argv._.filter(function(arg) {
  return fs.existsSync(arg);
}).forEach(function(arg) {
  if (file.isFile(arg)) {
    console.log('arg is a file:' + arg);
    isCSSFile(arg) && targetFiles.push(arg);
  } else if (file.isDir(arg)) {
    console.log('arg is a directory:' + arg);
    fs.readdirSync(arg).forEach(function(file) {
      isCSSFile(arg) && targetFiles.push(file);
    });
  } else {
    console.log('arg is the other:' + arg);
    glob(arg, function(error, files) {
      files.forEach(function(file) {
        isCSSFile(arg) && targetFiles.push(file);
      });
    });
  }
});

if (targetFiles.length === 0) {
  throw new Error('No css file is specified.');
} else {
  targetFiles.forEach(function(file) {
    console.info(file + ' is processing.')
  });
}

function isCSSFile(arg) {
  return (path.extname(arg) === '.css');
}