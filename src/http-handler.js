
module.exports = function (err) {
  var self = this;
  return function(req, res) {
    var method = req.method;
    var path = req.url;
    var entry = [method, path].join(' ');

    var result = self.match(entry);

    if (result && typeof result[0] === 'function') {
      result[0].apply(this, [req, res].concat(result[1]));
    } else if (typeof err === 'function') {
      if (result) {
        err.apply(this, [req, res, result[0]].concat(result[1]));
      } else {
        err.apply(this, [req, res]);
      }
    } else {
      res.end();
    }

    method = path = entry = result = null;
  };
};
