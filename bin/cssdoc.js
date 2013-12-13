#!/usr/bin/env node

// core
var fs = require('fs');
var path = require('path');

// external lib
var argv = require('optimist').argv;
var jade = require('jade');
var marked = require('marked');
var glob = require('glob');
var async = require('async');
var _ = require('underscore');

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
var targetMap = {};

// if argument is not specified
if (argv._.length === 0) {
  throw new Error('There is no argument.');
}

// if there is no css files
argv._.filter(function(arg) {
  return fs.existsSync(arg);
}).forEach(function(arg) {
  if (file.isFile(arg)) {
    // if arg is a file
    if (path.extname(arg) === '.css') {
      targetMap[path.basename(arg).replace('.css', '.html')] = function(callback) {
        callback(null, fs.readFileSync(arg, {encoding: 'utf8'}));
      };
    }
  } else if (file.isDir(arg)) {
    // arg is a directory
    fs.readdirSync(arg).forEach(function(file) {
      if (path.extname(file) === '.css') {
        targetMap[path.basename(file).replace('.css', '.html')] = function(callback) {
          callback(null, fs.readFileSync(arg, {encoding: 'utf8'}));
        };
      }
    });
  } else {
    // arg is the other
    glob(arg, function(error, files) {
      files.forEach(function(file) {
        if (path.extname(file) === '.css') {
          targetMap[path.basename(file).replace('.css', '.html')] = function(callback) {
            callback(null, fs.readFileSync(arg, {encoding: 'utf8'}));
          };
        }
      });
    });
  }
});

if (Object.keys(targetMap).length === 0) {
  throw new Error('No css file is specified.');
}

async.parallel(targetMap, function(error, results) {
  if (error) {
    throw error;
  }
  Object.keys(results).forEach(function(dest) {
    var cssString = results[dest];
    var re = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

    var comments = [];
    var result;
    while ((result = re.exec(cssString)) !== null) {
      comments.push(result[0]);
    }
    
    comments = _.compact(comments);
    comments = _.map(comments, function(comment) {
      return marked(comment.replace('/*', '').replace('*/', ''));
    });
    fs.writeFileSync('assets/temporary.html', comments.join(''), {
      encoding: 'utf8',
      flag: 'w'
    });
    fs.writeFileSync('assets/temporary.css', cssString, {
      encoding: 'utf8',
      flag: 'w'
    });
    jade.renderFile('assets/base.jade', {
      pretty: true
    }, function(error, html) {
      if (error) {
        throw error;
      }
      fs.writeFileSync(dest, html, {
        encoding: 'utf8',
        flag: 'w'
      });
    });
  });
});