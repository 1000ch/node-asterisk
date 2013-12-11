'use strict';

// core
var fs = require('fs');
var path = require('path');

// external
var iconv = require('iconv-lite');

var file = module.exports = {};

// The default file encoding to use.
file.defaultEncoding = 'utf8';
// Whether to preserve the BOM on file.read rather than strip it.
file.preserveBOM = false;

file.exists = function() {
  var filepath = path.join.apply(path, arguments);
  return fs.existsSync(filepath);
};

// True if the file is a symbolic link.
file.isLink = function() {
  var filepath = path.join.apply(path, arguments);
  return file.exists(filepath) && fs.lstatSync(filepath).isSymbolicLink();
};

// True if the path is a directory.
file.isDir = function() {
  var filepath = path.join.apply(path, arguments);
  return file.exists(filepath) && fs.statSync(filepath).isDirectory();
};

// True if the path is a file.
file.isFile = function() {
  var filepath = path.join.apply(path, arguments);
  return file.exists(filepath) && fs.statSync(filepath).isFile();
};

// Is a given file path absolute?
file.isPathAbsolute = function() {
  var filepath = path.join.apply(path, arguments);
  return path.resolve(filepath) === filepath.replace(/[\/\\]+$/, '');
};

var pathSeparatorRe = /[\/\\]/g;

file.mkdir = function(dirpath, mode) {
  if (mode === null) {
    mode = parseInt('0777', 8) & (~process.umask());
  }
  dirpath.split(pathSeparatorRe).reduce(function(parts, part) {
    parts += part + '/';
    var subpath = path.resolve(parts);
    if (!file.exists(subpath)) {
      try {
        fs.mkdirSync(subpath, mode);
      } catch(e) {
        throw new Error('Unable to create directory "' + subpath + '" (Error code: ' + e.code + ').', e);
      }
    }
    return parts;
  }, '');
};

// Read a file, return its contents.
file.read = function(filepath, options) {
  if (!options) { options = {}; }
  var contents;
  try {
    contents = fs.readFileSync(String(filepath));
    // If encoding is not explicitly null, convert from encoded buffer to a
    // string. If no encoding was specified, use the default.
    if (options.encoding !== null) {
      contents = iconv.decode(contents, options.encoding || file.defaultEncoding);
      // Strip any BOM that might exist.
      if (!file.preserveBOM && contents.charCodeAt(0) === 0xFEFF) {
        contents = contents.substring(1);
      }
    }
    return contents;
  } catch(e) {
    throw new Error('Unable to read "' + filepath + '" file (Error code: ' + e.code + ').', e);
  }
};

// Read a file, parse its contents, return an object.
file.readJSON = function(filepath, options) {
  var src = file.read(filepath, options);
  var result;
  try {
    result = JSON.parse(src);
    return result;
  } catch(e) {
    throw new Error('Unable to parse "' + filepath + '" file (' + e.message + ').', e);
  }
};