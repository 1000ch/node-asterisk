// core
var fs = require('fs');
var path = require('path');

// lib
var jade = require('jade');
var marked = require('marked');
var hljs = require('highlight.js');
var _ = require('underscore');

function Asterisk(cssPath, config) {

  // normalize path
  cssPath = path.normalize(cssPath);
  
  // check path
  if (!_isFile(cssPath) || path.extname(cssPath) !== '.css') {
    throw new Error(cssPath + ' is not css file.');
  }

  // force to be object
  this.config = config || {};
  this.cssPath = cssPath;
  
  // working directory & basename
  this.cwd = process.cwd();
  this.basename = this.config.title = path.basename(cssPath, '.css');

  if (!this.config.dest) {
    // if dest is not specified
    this.config.dest = path.join(this.cwd, this.basename + '.html');
  } else if (!_isDirectory(this.config.dest)) {
    // if dest is not a directory
    var dirname = path.dirname(this.config.dest);
    this.config.dest = path.join(dirname, this.basename + '.html');
  }

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
}

// css comment regular expression
// see http://www.w3.org/TR/CSS21/grammar.html
Asterisk.reCSSComment = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

Asterisk.prototype.parse = function () {
  var config = this.config;
  var cssString;
  var bodyString;
  
  cssString = fs.readFileSync(this.cssPath, {
    encoding: 'utf8'
  });
  var cssComments = [];
  var reResult;
  while ((reResult = Asterisk.reCSSComment.exec(cssString)) !== null) {
    var comment = _.first(reResult);
    if (comment) {
      cssComments.push(comment);
    }
  }
  bodyString = _.map(cssComments, function(cssComment) {
    var text = cssComment.replace('/*', '').replace('*/', '');
    return marked(text);
  }).join('');

  var templatePath = path.join(__dirname, '../assets/template.jade');
  jade.renderFile(templatePath, {
    pretty: true,
    title: config.title,
    css: cssString,
    body: bodyString
  }, renderCallback);

  function renderCallback(error, html) {
    if (error) {
      throw error;
    }
    fs.writeFileSync(config.dest, html, {
      encoding: 'utf8',
      flag: 'w'
    });
  }
};

function _isFile() {
  var file = path.join.apply(path, arguments);
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function _isDirectory() {
  var dir = path.join.apply(path, arguments);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

module.exports = Asterisk;