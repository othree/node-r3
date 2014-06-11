
var Router = require('../node-r3.js');

var router = Router.new({
    "/foo": "/foo[data]",
    "/foo/{id}": "/foo/[data]",
    "/bar/{uid}/{post_id}": "/bar/[data]/[data]",
});

console.log(router.match('/foo/bar'));
console.log(router.match('/foo'));
console.log(router.match('/bar/12/de'));
console.log(router.match('/bar/vvvv/54321'));
console.log(router.match('/bar'));
console.log(router.match('/bar/xd'));


router.free();
