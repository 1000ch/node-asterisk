#!/usr/bin/env node

var fs = require('fs');
var path = require('path');
var minimist = require('minimist');
var glob = require('glob');
var async = require('async');
var chalk = require('chalk');
var _ = require('underscore');

var util = require('../lib/util');
var Asterisk = require('../lib/asterisk');

// process arguments
var argv = minimist(process.argv.slice(2));

// if argument is not specified
if (argv._.length === 0) {
  console.log(chalk.red('There is no required argument.'));
  return;
}

// target files
var fileList = [];

// if there is no css files
argv._.filter(function(arg) {
  return fs.existsSync(arg);
}).forEach(function(arg) {
  if (util.isFile(arg)) {
    // if arg is a file
    fileList.push(arg);
  } else if (util.isDirectory(arg)) {
    // arg is a directory
    fs.readdirSync(arg).forEach(function(file) {
      fileList.push(file);
    });
  } else {
    // arg is the other
    glob(arg, function(error, files) {
      if (error) {
        throw error;
      }
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

async.each(cssList, function iterator(cssPath) {
  
  // html file name & directory
  var filename = path.basename(cssPath, '.css') + '.html';
  var directory;
  if (_.isString(argv.dest) && util.isDirectory(argv.dest)) {
    directory = argv.dest;
  } else {
    directory = process.cwd();
  }

  // get html string
  var html = new Asterisk(cssPath).parse();

  // save as html file
  var dest = path.join(directory, filename);
  fs.writeFileSync(dest, html, {
    encoding: 'utf8',
    flag: 'w'
  });

}, function finishCallback() {
  console.log(chalk.green('Done.'));
});