# slide-stream

Transform a stream of JSON slide metadata into a stream of HTML documents

[![build status](https://secure.travis-ci.org/noblesamurai/slide-stream.png)](http://travis-ci.org/noblesamurai/slide-stream)

## Installation

This module is installed via npm:

``` bash
$ npm install slide-stream
```

## Example Usage

Render a stream of slide-deck JSON into HTML documents. This example
registers two slide middleware rendering functions which will have the
option to render the current slide JSON, or to pass it to the next
middleware plugin:

``` js
var slideStream = require('slide-stream'),
    streamify = require('stream-array'),
    concat = require('concat-stream');

// Simple Title Slide Middleware
function titleSlide() {
  return function (slide, cb) {
    // if slide is not for me, then go to next middleware
    if (slide.type !== 'title') return cb();

    var html =
      '<h1>' + slide.title + '</h1>\n' +
      '<b>' + slide.body + '</b>\n' +
      '<hr>\n';
    cb(null, html);
  };
}

// Default Slide
function defaultSlide() {
  return function (slide, cb) {
    // No check: always render
    var html =
      '<h2>' + slide.title + '</h2>\n' +
      '<b>' + slide.body + '</b>\n';
    cb(null, html);
  };
}

var slides = slideStream(),

// register middleware stack, order of registration is order of application
slides.use(titleSlide());
slides.use(defaultSlide());

// sample JSON stream of deck slides
var deck = [
  { type: 'title', title: 'Slide 0', body: 'This is Slide 0' },
  { type: 'default', title: 'Slide 1', body: 'This is Slide 1' },
  { type: 'default', title: 'Slide 2', body: 'This is Slide 2' },
];

streamify(deck)
  .pipe(slides)
  .pipe(concat({ encoding: 'object' }, function (results) {
    console.log(results);
    // [ '<h1>Slide 0</h1>\n<b>This is Slide 0</b>\n<hr>\n',
    //   '<h2>Slide 1</h2>\n<b>This is Slide 1</b>\n',
    //   '<h2>Slide 2</h2>\n<b>This is Slide 2</b>\n' ]
  }));
```

## API

### SlideStream()

Returns a new instance of a slide Transform stream.

### SlideStream#use(middleware)

Register a middleware with the slide stream. See API below for details.

## Middleware API

Each slide middleware function has the following signature:

### middleware(slide, cb)

Where:

* `slide` - is the slide fragment of JSON that will contain the metadata of
the slide that will be rendered.
* `cb(err, html)`:
    * `err` - error if there was an error.
    * `html` - if this present, then this HTML will be rendered out of the
    stream. If `undefined`, then the next middleware render plugin will be
    called.
