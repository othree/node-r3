/*jslint forin: true */

var Router = require('./src/router');

exports.Router = function (routes) {
  return new Router(routes);
};

exports.PathRouter = function (routes) {
  return new Router(routes, {path: true});
};

