node-r3
=======

Node.js [r3][r3] binding.

Still in development.


Usage
-----

    Router = require('node-r3');

    var router = Router.new({
      "/foo": "data string",
      "/foo/bar": "data string 2"
    });

    var dispatched = router.match("/foo");

    router.free();

[r3]:https://github.com/c9s/r3
