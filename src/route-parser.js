/*jslint bitwise: true */

const METHOD_GET = 2;
const METHOD_POST = 2<<1;
const METHOD_PUT = 2<<2;
const METHOD_DELETE = 2<<3;
const METHOD_PATCH = 2<<4;
const METHOD_HEAD = 2<<5;
const METHOD_OPTIONS = 2<<6;

const METHODS = {
  GET: METHOD_GET,
  POST: METHOD_POST,
  PUT: METHOD_PUT,
  DELETE: METHOD_DELETE,
  PATCH: METHOD_PATCH,
  HEAD: METHOD_HEAD,
  OPTIONS: METHOD_OPTIONS
};

module.exports = function (route) {
  route = route.trim();
  var route_frag = route.split(' ');
  var m, method = 0;
  if (route_frag.length > 1) {
    method = route_frag.shift().toUpperCase();
    var condition = parseInt(method, 0);
    if (isNaN(condition)) {
      methods = method.split(/[,|]/);
      method = 0;
      while ((m = methods.shift())) {
        method = method | METHODS[m];
      }
    } else {
      method = condition;
    }
    route = route_frag.join(' ').trim();
    if (!method) { throw new Error("method not exist."); }
  }
  return [route, method]
};

