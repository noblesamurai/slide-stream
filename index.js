var stream = require('stream'),
    util = require('util');

module.exports = SlideStream;

function SlideStream() {
  if (!(this instanceof SlideStream)) {
    return new SlideStream();
  }
  stream.Transform.call(this, { objectMode: true });
  this.middleware = [];
}
util.inherits(SlideStream, stream.Transform);

SlideStream.prototype.use = function (middleware) {
  this.middleware.push(middleware);
};

SlideStream.prototype._transform = function (slide, enc, cb) {
  var self = this;
  var stack = this.middleware.slice();

  function next(err, results) {
    if (err) return cb(err);
    if (results) {
      self.push(results);
      return cb();
    }
    var plugin = stack.shift();
    if (typeof plugin !== 'undefined') {
      try {
        plugin(slide, next);
      } catch (err) {
        // make sure we always return
        if (err) return cb(err);
      }
    } else {
      cb();
    }
  }

  next();
};
