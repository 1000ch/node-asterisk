var fs = require('fs');
var path = require('path');

function isFile() {
  var file = path.join.apply(path, arguments);
  return fs.existsSync(file) && fs.statSync(file).isFile();
}

function isDirectory() {
  var dir = path.join.apply(path, arguments);
  return fs.existsSync(dir) && fs.statSync(dir).isDirectory();
}

module.exports = {
  isFile: isFile,
  isDirectory: isDirectory
};