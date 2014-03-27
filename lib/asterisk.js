// core
var fs = require('fs');
var path = require('path');

// lib
var jade = require('jade');
var marked = require('marked');
var hljs = require('highlight.js');

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

function Asterisk(cssPath) {

  // normalize path
  cssPath = path.normalize(cssPath);
  
  // check path
  if (!util.isFile(cssPath) || path.extname(cssPath) !== '.css') {
    throw new Error(cssPath + ' is not css file.');
  }

  this.cssPath = cssPath;
}

Asterisk.prototype.parse = function () {

  // as title
  var name = path.basename(this.cssPath, '.css');

  // original css
  var rawCss = fs.readFileSync(this.cssPath, {
    encoding: 'utf8'
  });

  // pick comments and paired css string
  var comments = Asterisk.pickComments(rawCss);
  var sourcePairs = [];
  comments.forEach(function (comment) {
    var pairedCSS = Asterisk.getPairedCSS(comment, rawCss);
    sourcePairs.push({
      comment: comment,
      css: pairedCSS
    });
  });

  // parse comment and add it as html
  for (var i = 0, l = sourcePairs.length;i < l;i++) {
    var markdown = sourcePairs[i].comment.replace('/*', '').replace('*/', '');
    sourcePairs[i].html = marked(markdown);
    sourcePairs[i].css = hljs.highlight('css', sourcePairs[i].css).value;
  }

  var template = path.join(__dirname, '../assets/template.jade');
  var options = {
    pretty: true,
    title: name,
    css: rawCss,
    pairs: sourcePairs
  };

  return jade.renderFile(template, options);
};

// css comment regular expression
// see http://www.w3.org/TR/CSS21/grammar.html
var reCSSComment = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;

Asterisk.pickComments = function (cssString) {

  // comments
  var result = [];
  var match;

  while ((match = reCSSComment.exec(cssString)) !== null) {
    result.push(match.shift());
  }
  
  return result;
};

Asterisk.getPairedCSS = function (comment, cssString) {

  // paired css
  var result = '';
  var startIndex = cssString.indexOf(comment);

  if (startIndex !== -1) {
    var rest = cssString.slice(startIndex).replace(comment, '');
    var nextIndex = rest.search(reCSSComment);
    if (nextIndex !== -1) {
      result = rest.slice(0, nextIndex);
    } else {
      result = rest.slice();
    }
  }
  return result;
};

module.exports = Asterisk;