/*jslint forin: true */
var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');

var node = StructType({
  edges: "pointer",

  edge_len: "uchar",
  compare_type: "uchar",
  endpoint: "uchar",
  ov_cnt: "uchar",

  edge_cap: "uchar",
  route_len: "uchar",
  route_cap: "uchar",

  pcre_pattern: "pointer",
  pcre_extra: "pointer",

  routes: "pointer",

  combined_pattern: "string",

  data: "pointer"
});

var route = StructType({
  path: "string",
  path_len: "int",

  request_method: "int",

  host: "string",
  host_len: "int",

  data: "pointer",

  remote_addr_pattern: "string",
  remote_addr_pattern_len: "int"
});

var StringArray = ArrayType("string");
var str_array = StructType({
  tokens: "pointer",
  len: "int",
  cap: "int"
});

var match_entry = StructType({
  vars: ref.refType(str_array),
  path: "string",
  path_len: "int",
  request_method: "int",

  data: "pointer",

  host: "pointer",
  host_len: "int",

  remote_addr: "pointer",
  remote_addr_len: "int"
});

// edge = StructType({
// pattern: "string",
// child: "pointer",
// pattern_len: "ushort",
// opcode: "uchar",
// has_slug: "uchar"
// });

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

var ffi = require('ffi');

var libr3 = ffi.Library('libr3', {
  "r3_tree_create": ["pointer", ["int"]],

  // node * r3_tree_insert_pathl_ex(node *tree, const char *path, int path_len, route * route, void * data, char ** errstr);
  "r3_tree_insert_pathl_ex": ["pointer", ["pointer", "string", "int", "pointer", "pointer", "pointer"]],

  // route * r3_tree_insert_routel_ex(node *tree, int method, const char *path, int path_len, void *data, char **errstr);
  "r3_tree_insert_routel_ex": ["pointer", ["pointer", "int", "string", "int", "pointer", "pointer"]],

  "r3_tree_compile": ["void", ["pointer"]],
  "r3_tree_dump": ["void", ["pointer", "int"]],

  // node * r3_tree_matchl(const node * n, const char * path, int path_len, match_entry * entry);
  "r3_tree_matchl": [ref.refType(node), ["pointer", "string", "int", "pointer"]],

  // route * r3_tree_match_route(const node *n, match_entry * entry);
  "r3_tree_match_route": [ref.refType(route), ["pointer", "pointer"]],

  "r3_tree_free": ["void", ["pointer"]],

  "match_entry_createl": [ref.refType(match_entry), ["string", "int"]],
  "match_entry_free": ["void", ["pointer"]],
});

var r3_tree_insert_path = function (tree, path, data) {
  return libr3.r3_tree_insert_pathl_ex(tree, path, path.length, null, data, null);
};

var r3_tree_insert_route = function (tree, method, path, data) {
  return libr3.r3_tree_insert_routel_ex(tree, method, path, path.length, data, null);
};

var match_entry_create = function (path) {
  return libr3.match_entry_createl(path, path.length);
};

var r3_tree_match = function (tree, path, entry) {
  return libr3.r3_tree_matchl(tree, path, path.length, entry);
};

var Router = function (routes) {
  var route, data, method, route_frag, i = 0;
  this.tree = libr3.r3_tree_create(10);
  this.data = [];
  this.index = []
  for (route in routes) {
    this.data[i] = routes[route];
    data = ref.alloc('int', i).ref();
    this.index[i] = data; // prevent GC
    route = route.trim();
    route_frag = route.split(' ');
    if (route_frag.length > 1) {
      route = route_frag[1];
      method = METHODS[route_frag[0].toUpperCase()];
      if (!method) { throw new Error(route_frag[0] + "method not exist."); }
      r3_tree_insert_route(this.tree, method, route, data);
    } else {
      r3_tree_insert_route(this.tree, 0, route, data);
    }
    i++;
  }
  libr3.r3_tree_compile(this.tree);
  return this;
};

Router.prototype.dump = function () {
  if (!this.tree) { return; }
  libr3.r3_tree_dump(this.tree, 0);
};

Router.prototype.match = function (path) {
  if (!this.tree) { return; }
  var entry;

  path = path.trim();
  var path_frag = path.split(' ');
  if (path_frag.length > 1) {
    path = path_frag[1];
    entry = match_entry_create(path);
    method = METHODS[path_frag[0].toUpperCase()];
    entry.deref().request_method = method;
  } else {
    entry = match_entry_create(path);
  }

  var node = libr3.r3_tree_match_route(this.tree, entry);

  if (ref.isNull(node)) { return; }

  var index = node.deref().data.reinterpret(8).readPointer(0, 4).readUInt32LE(0);
  var data = this.data[index];
  index = null;

  var vars = entry.deref().vars.deref();
  var capturesBuffer = new StringArray(vars.tokens.reinterpret(vars.len * ref.types.CString.size));
  var captures = [], i;
  for (i = 0; i < capturesBuffer.length; i++) {
    captures.push(capturesBuffer[i]);
  }

  libr3.match_entry_free(entry);
  capturesBuffer = null;
  node = null;
  return [data, captures];
};

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
    var entry = method + " " + path;

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


