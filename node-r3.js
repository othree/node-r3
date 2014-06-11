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


var ffi = require('ffi');

var libr3 = ffi.Library('libr3', {
    "r3_tree_create": ["pointer", ["int"]],
    "r3_tree_insert_pathl_ex": ["pointer", ["pointer", "string", "int", "pointer", "pointer", "pointer"]],
    "r3_tree_compile": ["void", ["pointer"]],
    "r3_tree_dump": ["void", ["pointer", "int"]],
    "r3_tree_matchl": [ref.refType(node), ["pointer", "string", "int", "pointer"]],

    "r3_node_find_edge": ["pointer", ["pointer", "string", "int"]],
    "r3_tree_free": ["void", ["pointer"]],

    "match_entry_createl": [ref.refType(match_entry), ["string", "int"]],
});

var r3_tree_insert_path = function (tree, path, data) {
    // console.log('insert', data);
    return libr3.r3_tree_insert_pathl_ex(tree, path, path.length, null, data, null);
};

var r3_tree_insert_pathl = function (tree, path, len, data) {
    return libr3.r3_tree_insert_pathl_ex(tree, path, len, null, data, null);
};

var n = libr3.r3_tree_create(10);
var data0 = new Buffer('BOMMMM\u0000');
var data1 = new Buffer('BOOM\u0000');
var data2 = new Buffer('FOFOFOFO\u0000');

// console.log(ref.readCString(data2).slice(0, -4));
// console.log(data1);
// console.log(data2);

console.log( ref.reinterpretUntilZeros(data2, 1).toString('hex') );

// var nodea = r3_tree_insert_path(n, "", data0);
var nodea = r3_tree_insert_path(n, "/zoo", data1);
var nodeb = r3_tree_insert_path(n, "/foo", data2);
var nodec = r3_tree_insert_path(n, "/foo/{id}/{uid:[a-z]+}", data2);

// console.log('b', nodeb);


libr3.r3_tree_compile(n);
// console.log('[compiled]', n);
libr3.r3_tree_dump(n, 0);

var entry = libr3.match_entry_createl("/foo/barr/qoaa", 14);
var node = libr3.r3_tree_matchl(n, "/foo/barr/qoaa", 14, entry);

// console.log('receive');
// console.log(node.deref().data);
console.log(ref.readCString(node.deref().data, 0));
console.log( ref.reinterpretUntilZeros(node.deref().data, 1).toString('hex') );
// console.log(node.toString('hex'));
// console.log('receive end');

console.log(entry.deref().vars.deref());
var b = entry.deref().vars.deref();

var bs = new StringArray(ref.reinterpret(b.tokens, b.len * ref.types.CString.size));
console.log(bs.length);

libr3.r3_tree_free(n);

