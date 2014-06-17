/*jslint forin: true */
var ref = require('ref');
var ArrayType = require('ref-array');
var StringArray = ArrayType("string");

var libr3 = require('../lib/libr3');

var route_parser = require('./route-parser');

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

Router.prototype.dump = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_dump(this.tree, 0);
};

Router.prototype.free = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_free(this.tree);
  this.tree = null;
};

Router.prototype.insert_route = function (route, data) {
  if (!this.tree) { return; }
  var methods;
  var i = this.i++;
  this.data[i] = data;
  this.index[i] = ref.alloc('int', i).ref(); // prevent GC
  var parsed = route_parser(route);
  route = parsed[0];
  method = parsed[1];
  libr3.r3_tree_insert_route(this.tree, method, route, this.index[i]);
};

Router.prototype.insert_path = function (path, data) {
  if (!this.tree) { return; }
  var i = this.i++;
  this.data[i] = data;
  this.index[i] = ref.alloc('int', i).ref(); // prevent GC
  path = path.trim();
  libr3.r3_tree_insert_path(this.tree, path, this.index[i]);
};

Router.prototype.match_route = function (route) {
  if (!this.tree) { return; }
  var entry, method, condition;

  var parsed = route_parser(route);
  route = parsed[0];
  method = parsed[1];
  entry = libr3.match_entry_create(route);
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

Router.prototype.insert = Router.prototype.insert_route;
Router.prototype.match = Router.prototype.match_route;

Router.prototype.httpHandler = require('./http-handler');

module.exports = Router;
