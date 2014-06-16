/*jslint forin: true, bitwise: true */
var ref = require('ref');

var header = require('./header.js');

var node = header.node;
var route = header.route;
var match_entry = header.match_entry;

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


module.exports = {
  "r3_tree_create": libr3.r3_tree_create, 
  "r3_tree_insert_pathl_ex": libr3.r3_tree_insert_pathl_ex, 
  "r3_tree_insert_routel_ex": libr3.r3_tree_insert_routel_ex, 
  "r3_tree_compile": libr3.r3_tree_compile, 
  "r3_tree_dump": libr3.r3_tree_dump, 
  "r3_tree_matchl": libr3.r3_tree_matchl, 
  "r3_tree_match_route": libr3.r3_tree_match_route, 
  "r3_tree_free": libr3.r3_tree_free, 
  "match_entry_createl": libr3.match_entry_createl, 
  "match_entry_free": libr3.match_entry_free, 

  "r3_tree_insert_path": r3_tree_insert_path,
  "r3_tree_insert_route": r3_tree_insert_route,
  "match_entry_create": match_entry_create,
  "r3_tree_match": r3_tree_match,
};

