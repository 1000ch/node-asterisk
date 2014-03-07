# node-asterisk [![Build Status](https://travis-ci.org/1000ch/node-asterisk.png?branch=master)](https://travis-ci.org/1000ch/node-asterisk)

## About

CSS document generator.

## Usage

### Prepare

At first, add comment to css file.

```css
/*
<button class='btn btn-primary'>Primary Button</button>

```` ```html ````
<button class='btn btn-primary'>Primary Button</button>
```` ``` ````
*/
.btn {
  display: inline-block;
  width: 200px;
  border-radius: 5px;
  font-size: 24px;
  line-height: 1.5;
}
.btn.btn-primary {
  color: #fff;
  background-color: #3276b1;
  border-color: #285e8e;
}
```

### Generate

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
- [markdown.css](http://github.com/1000ch/markdown.css)

## License

MIT.
