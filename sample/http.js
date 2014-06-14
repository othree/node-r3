#!/usr/local/bin/node
require('v8-profiler');
var http = require('http');
var Router = require('../').Router;

var handler = function (route) {
  return function (req, res, params) {
    var content = req.method + ' ' + req.url + ' ' + route + ' ';
    if (params) { content += params.toString(); }
    res.end(content);
    content = null;
  };
};

var router = new Router({
  "/": handler("/index"),
  "/foo": handler("/foo"),
  "/foo/{id}": handler("/foo/[data]"),
  "/bar/{uid}/{post_id}": handler("/bar/[data]/[data]"),
  "POST /getme2": handler("/getme[post]"),
  "PUT /getme1": handler("/getme[put]"),
  "GET /getme3": handler("/getme[get]"),
  "PUT /ugetme1": handler("/ugetme[put]"),
  "POST /ugetme2": handler("/ugetme[post]"),
  "GET /ugetme3": handler("/ugetme[get]"),
});

router.dump();
var notfound = handler('404');

var server = http.createServer(router.httpHandler(notfound));

server.listen(5000);

console.log('Listen on http://localhost:5000/');
