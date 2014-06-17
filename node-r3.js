/*jslint forin: true, bitwise: true */
var ref = require('ref');
var ArrayType = require('ref-array');
var StringArray = ArrayType("string");

var libr3 = require('./libr3.js');

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

var Router = function (routes, options) {
  if (!routes) { routes = {}; }
  if (!options) { options = {}; }
  if (options.path) {
    this.insert = Router.prototype.insert_path;
    this.match = Router.prototype.match_path;
  }
  var route;
  this.tree = libr3.r3_tree_create(10);
  this.index = [];
  this.data = [];
  this.i = 0;
  for (route in routes) {
    this.insert(route, routes[route]);
  }
  if (this.i) {
    this.compile();
  }

  return this;
};

Router.prototype.compile = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_compile(this.tree);
};

Router.prototype.insert_route = function (route, route_data) {
  if (!this.tree) { return; }
  var m, methods;
  var i = this.i++;
  this.data[i] = route_data;
  this.index[i] = ref.alloc('int', i).ref(); // prevent GC
  route = route.trim();
  var route_frag = route.split(' ');
  var method = 0;
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
  libr3.r3_tree_insert_route(this.tree, method, route, this.index[i]);
};

Router.prototype.insert_path = function (route, route_data) {
  if (!this.tree) { return; }
  var i = this.i++;
  this.data[i] = route_data;
  this.index[i] = ref.alloc('int', i).ref(); // prevent GC
  route = route.trim();
  libr3.r3_tree_insert_path(this.tree, route, this.index[i]);
};
Router.prototype.insert = Router.prototype.insert_route;

Router.prototype.dump = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_dump(this.tree, 0);
};

Router.prototype.match_route = function (path) {
  if (!this.tree) { return; }
  var entry, method, condition;

  path = path.trim();
  var path_frag = path.split(' ');
  if (path_frag.length > 1) {
    method = path_frag.shift().toUpperCase();
    path = path_frag.join(' ').trim();
    condition = parseInt(method, 0);
    if (isNaN(condition)) {
      method = METHODS[method];
    } else {
      method = condition;
    }
  }
  entry = libr3.match_entry_create(path);
  if (method !== undefined) {
    entry.deref().request_method = method;
  }

  var node = libr3.r3_tree_match_route(this.tree, entry);

  if (ref.isNull(node)) { 
    // free
    libr3.match_entry_free(entry);
    entry = method = condition = null;
    return;
  }

  var index = node.deref().data.reinterpret(8).readPointer(0, 4).readUInt32LE(0);
  var data = this.data[index];

  var vars = entry.deref().vars.deref();
  var capturesBuffer = new StringArray(vars.tokens.reinterpret(vars.len * ref.types.CString.size));
  var captures = [], i;
  for (i = 0; i < capturesBuffer.length; i++) {
    captures.push(capturesBuffer[i]);
  }

  // free
  libr3.match_entry_free(entry);
  entry = method = null;
  capturesBuffer = index = node = null;
  return [data, captures];
};

Router.prototype.match_path = function (path) {
  if (!this.tree) { return; }

  var entry = libr3.match_entry_create(path);
  var node = libr3.r3_tree_match(this.tree, path, entry);

  if (ref.isNull(node)) { 
    // free
    libr3.match_entry_free(entry);
    entry = null;
    return;
  }

  var index = node.deref().data.reinterpret(8).readPointer(0, 4).readUInt32LE(0);
  var data = this.data[index];

  var vars = entry.deref().vars.deref();
  var capturesBuffer = new StringArray(vars.tokens.reinterpret(vars.len * ref.types.CString.size));
  var captures = [], i;
  for (i = 0; i < capturesBuffer.length; i++) {
    captures.push(capturesBuffer[i]);
  }

  // free
  libr3.match_entry_free(entry);
  entry = null;
  capturesBuffer = index = node = null;
  return [data, captures];
};
Router.prototype.match = Router.prototype.match_route;

Router.prototype.free = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_free(this.tree);
  this.tree = null;
};

Router.prototype.httpHandler = function (err) {
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

exports.Router = function (routes) {
  return new Router(routes);
};

exports.PathRouter = function (routes) {
  return new Router(routes, {path: true});
};

