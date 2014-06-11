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
    return libr3.r3_tree_insert_pathl_ex(tree, path, path.length, null, data, null);
};

var match_entry_create = function (path) {
    return libr3.match_entry_createl(path, path.length);
};
var r3_tree_match = function (tree, path, entry) {
    return libr3.r3_tree_matchl(tree, path, path.length, entry);
};

var Router = function (routes, dump) {
    var route, data;
    this.tree = libr3.r3_tree_create(10);
    for (route in routes) {
        data = routes[route];
        data = new Buffer(data + '\u0000');
        r3_tree_insert_path(this.tree, route, data);
    }
    libr3.r3_tree_compile(this.tree);
    if (dump) {
        libr3.r3_tree_dump(this.tree, 0);
    }
    return this;
};

Router.prototype.match = function (path) {
    var entry = match_entry_create(path);
    var node = r3_tree_match(this.tree, path, entry);
    if (ref.isNull(node)) {
        return;
    }
    var data = ref.readCString(node.deref().data, 0);
    var vars = entry.deref().vars.deref();
    var capturesBuffer = new StringArray(ref.reinterpret(vars.tokens, vars.len * ref.types.CString.size));
    var captures = [];
    var i;

    for (i = 0; i < capturesBuffer.length; i++) {
        captures.push(capturesBuffer[i]);
    }

    return [data, captures];
};

Router.prototype.free = function () {
    libr3.r3_tree_free(this.tree);
};

exports.new = function (routes) {
    return new Router(routes);
};

