// core
var fs = require('fs');
var path = require('path');

// lib
var jade = require('jade');
var marked = require('marked');
var hljs = require('highlight.js');
var _ = require('underscore');

var util = require('./util');

// set marked options
marked.setOptions({
  gfm: true,            // Enable GitHub flavored markdown.
  tables: true,         // Enable GFM tables. This option requires the gfm option to be true.
  breaks: true,         // Enable GFM line breaks. This option requires the gfm option to be true.
  pedantic: false,      // Conform to obscure parts of markdown.pl as much as possible. Don't fix any of the original markdown bugs or poor behavior.
  sanitize: false,      // Sanitize the output. Ignore any HTML that has been input.
  smartLists: true,     // Use smarter list behavior than the original markdown. May eventually be default with the old behavior moved into pedantic.
  smartypants: false,   // Use "smart" typograhic punctuation for things like quotes and dashes.
  highlight: function (code) {
    return hljs.highlightAuto(code).value;
  }
});

function Asterisk(cssPath, dest) {

  // normalize path
  cssPath = path.normalize(cssPath);
  
  // check path
  if (!util.isFile(cssPath) || path.extname(cssPath) !== '.css') {
    throw new Error(cssPath + ' is not css file.');
  }

  this.cssPath = cssPath;
  
  // working directory & basename
  this.cwd = process.cwd();
  this.basename = path.basename(cssPath, '.css');

  if (_.isString(dest) && util.isDirectory(dest)) {
    this.dest = dest;
  } else {
    this.dest = this.cwd;
  }
}

// css comment regular expression
// see http://www.w3.org/TR/CSS21/grammar.html
Asterisk.reCSSComment = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

Asterisk.prototype.parse = function () {

  var dest = this.dest;
  var name = path.basename(this.cssPath, '.css');

  var css = fs.readFileSync(this.cssPath, {
    encoding: 'utf8'
  });

  var comments = [];
  var m;
  while ((m = Asterisk.reCSSComment.exec(css)) !== null) {
    var comment = _.first(m);
    if (comment) {
      comments.push(comment);
    }
  }

  var body = _.map(comments, function(comment) {
    var text = comment.replace('/*', '').replace('*/', '');
    return marked(text);
  }).join('');

  var template = path.join(__dirname, '../assets/template.jade');
  var options = {
    pretty: true,
    title: name,
    css: css,
    body: body
  };

  jade.renderFile(template, options, function (error, html) {
    if (error) {
      throw error;
    }
    fs.writeFileSync(path.join(dest, name + '.html'), html, {
      encoding: 'utf8',
      flag: 'w'
    });
  });
};

module.exports = Asterisk;