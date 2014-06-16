/*jslint forin: true, bitwise: true */
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

exports.node = node;
exports.route = route;
exports.match_entry = match_entry;

