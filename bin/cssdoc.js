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
  gfm: true,            // Enable GitHub flavored markdown.
  tables: true,         // Enable GFM tables. This option requires the gfm option to be true.
  breaks: true,         // Enable GFM line breaks. This option requires the gfm option to be true.
  pedantic: false,      // Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
  sanitize: false,      // Sanitize the output. Ignore any HTML that has been input.
  smartLists: true,     // Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
  smartypants: false    // Use "smart" typograhic punctuation for things like quotes and dashes.
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
    addMap(targetMap, arg);
  } else if (file.isDir(arg)) {
    // arg is a directory
    fs.readdirSync(arg).forEach(function(file) {
      addMap(targetMap, file);
    });
  } else {
    // arg is the other
    glob(arg, function(error, files) {
      files.forEach(function(file) {
        addMap(targetMap, file);
      });
    });
  }
});

if (Object.keys(targetMap).length === 0) {
  throw new Error('No css file is specified.');
}

// css comment regular expression
// see http://www.w3.org/TR/CSS21/grammar.html
var re = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

async.parallel(targetMap, function(error, results) {
  if (error) {
    throw error;
  }
  var keys = Object.keys(results);
  _.each(keys, function(dest) {
    var cssString = results[dest];

    var comments = [];
    var result;
    while ((result = re.exec(cssString)) !== null) {
      var comment = _.first(result);
      if (comment) {
        comments.push(comment);
      }
    }
    comments = _.map(comments, function(comment) {
      var text = comment.replace('/*', '').replace('*/', '');
      return marked(text);
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

function addMap(map, filePath) {
  var fileName = path.basename(filePath);
  if (path.extname(fileName) !== '.css') {
    return;
  }

  // temporary file name
  // comment of css will be saved as html 
  var key = fileName.replace('.css', '.html');
  
  // function to load css executed at async.parallel
  // callback result will be stacked as results
  var value = function(callback) {
    callback(null, fs.readFileSync(filePath, {encoding: 'utf8'}));
  };

  map[key] = value;
}