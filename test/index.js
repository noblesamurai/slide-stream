var expect = require('expect.js'),
    streamify = require('stream-array'),
    concat = require('concat-stream'),
    slideStream = require('..');

// Simple Title Slide Middleware
function titleSlide() {
  return function (slide, res, cb) {
    // if slide is not for me, then go to next middleware
    if (slide.type !== 'title') return cb();

    var html =
      '<h1>' + slide.title + '</h1>\n' +
      '<b>' + slide.body + '</b>\n' +
      '<hr>\n';
    res.push(html);
    cb(null, true);
  };
}

// Default Slide
function defaultSlide() {
  return function (slide, res, cb) {
    // No check: always render
    var html =
      '<h2>' + slide.title + '</h2>\n' +
      '<b>' + slide.body + '</b>\n';
    res.push(html);
    cb(null, true);
  };
}

describe('slide-stream', function() {
  it('should be able to create some HTML files', function(done) {
    var slides = slideStream();

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
        expect(results).to.eql([
          '<h1>Slide 0</h1>\n<b>This is Slide 0</b>\n<hr>\n',
          '<h2>Slide 1</h2>\n<b>This is Slide 1</b>\n',
          '<h2>Slide 2</h2>\n<b>This is Slide 2</b>\n' ]);
        done();
      }));
  });
});
