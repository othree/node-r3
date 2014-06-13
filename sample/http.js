var http = require('http');
var Router = require('../');

var handler = function (route) {
  return function (req, res, params) {
    var content = req.method + ' ' + req.url + ' ' + route + ' ';
    if (params) { content += params.toString(); }
    res.end(content);
  };
};

var router = Router.new({
  "/": handler("/index"),
  "/foo": handler("/foo"),
  "/foo/{id}": handler("/foo/[data]"),
  "/bar/{uid}/{post_id}": handler("/bar/[data]/[data]"),
  "PUT /getme": handler("/getme[post]"),
  "POST /getme": handler("/getme[post]"),
  "GET /getme": handler("/getme[get]"),
  "PUT /ugetme": handler("/getme[post]"),
  "POST /ugetme": handler("/getme[post]"),
  "GET /ugetme": handler("/getme[get]"),
});

  var notfound = handler('404');

var server = http.createServer(router.httpHandler(notfound));

server.listen(5000);

console.log('Listen on http://localhost:5000/');
