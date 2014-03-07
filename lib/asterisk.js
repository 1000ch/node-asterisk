// core
var fs = require('fs');
var path = require('path');

// lib
var jade = require('jade');
var marked = require('marked');
var _ = require('underscore');

// css comment regular expression
// see http://www.w3.org/TR/CSS21/grammar.html
var reCSSComment = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

function Asterisk(cssPath, options) {

  // current directory
  var cwd = process.cwd();

  // normalize path
  cssPath = path.normalize(cssPath);
  
  // check path
  if (!_isFile(cssPath) || path.extname(cssPath) !== '.css') {
    throw new Error(cssPath + ' is not css file.');
  }

  // force to be object
  this.options = options || {};
  this.cssPath = cssPath;
  if (!this.options.dest) {
    var basename = path.basename(cssPath, '.css');
    this.options.dest = path.join(cwd, basename + '.html');
  }
  if (!this.options.title) {
    this.options.title = '';
  }

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
}

Asterisk.prototype.parse = function () {
  var options = this.options;
  var cssString;
  var bodyString;
  
  cssString = fs.readFileSync(this.cssPath, {
    encoding: 'utf8'
  });
  var cssComments = [];
  var reResult;
  while ((reResult = reCSSComment.exec(cssString)) !== null) {
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
    title: options.title,
    cssString: cssString,
    bodyString: bodyString
  }, renderCallback);

  function renderCallback(error, html) {
    if (error) {
      throw error;
    }
    fs.writeFileSync(options.dest, html, {
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