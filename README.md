# node-asterisk [![Build Status](https://travis-ci.org/1000ch/node-asterisk.png?branch=master)](https://travis-ci.org/1000ch/node-asterisk)

## About

CSS document generator.

## Usage

You can use this from cli.

```sh
$ npm install -g asterisk
$ asterisk sample.css
```

From JavaScript code, require this simply.

```js
var Asterisk = require('asterisk');
var asterisk = new Asterisk('sample.css');
asterisk.parse();
```

## Resources

- [CSS Tools: Reset CSS](http://meyerweb.com/eric/tools/css/reset/)

## License

MIT.
