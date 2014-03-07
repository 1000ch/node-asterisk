#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var glob = require('glob');
var async = require('async');
var chalk = require('chalk');

var Asterisk = require('../lib/asterisk');

// process arguments
var argv = minimist(process.argv.slice(2));

// if argument is not specified
if (argv._.length === 0) {
  console.log(chalk.red('There is no argument.'));
  return;
}

// target files
var fileList = [];

// if there is no css files
argv._.filter(function(arg) {
  return fs.existsSync(arg);
}).forEach(function(arg) {
  if (_isFile(arg)) {
    // if arg is a file
    fileList.push(arg);
  } else if (_isDirectory(arg)) {
    // arg is a directory
    fs.readdirSync(arg).forEach(function(file) {
      fileList.push(file);
    });
  } else {
    // arg is the other
    glob(arg, function(error, files) {
      files.forEach(function(file) {
        fileList.push(file);
      });
    });
  }
});

var cssList = fileList.filter(function (file) {
  return (path.extname(file) === '.css');
});

if (cssList.length === 0) {
  console.log(chalk.red('No css file is specified.'));
}

var options = {};

async.each(cssList, function iterator(css) {
  var asterisk = new Asterisk(css, options);
  asterisk.parse();
}, function finishCallback() {
  console.log(chalk.green('Done.'));
});

function _isFile() {
  var file = path.join.apply(path, arguments);
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function _isDirectory() {
  var dir = path.join.apply(path, arguments);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}