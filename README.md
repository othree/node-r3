node-r3
=======

Node.js [r3][r3] binding.

[![Build Status](https://travis-ci.org/othree/node-r3.svg?branch=master)](https://travis-ci.org/othree/node-r3)

Usage
-----

Basic usage:

    Router = require('node-r3').Router;

    var router = new Router({
      "/foo": "data string",
      "/foo/bar": function () {},
      "/foo/bar/qoo": {obj: 1},
    });

    var dispatched = router.match("/foo");

    router.free();

The router's initial argument is an POJSO(Plain Old JavaScript Object). Key is route path and value is data. It is possible to add method condition in route, ex: `GET /foo`. And all JS data type can be used for data. Method condition can support 3 format.

1. Single method, ex: `GET`, `POST`.
2. Multiple method. Both `,` and `|` can be used as separator. Ex: `GET,POST` or `POST|PUT`.
3. Integer in string, ex: `1`, `4`.

Condition supports following HTTP methods:

* GET
* POST
* PUT
* DELETE
* PATCH
* HEAD
* OPTIONS

There is a http handler helper function:

    var router = new Router({
      "/": handler,
      "/foo": fooHandler,
      "/foo/{id}": fooHandler,
      "POST /me": postMeHandler,
      "GET /me": getMeHandler,
      "POST|GET /post": postHandler,
    });

    var server = http.createServer(router.httpHandler(notfound));

If the data is a function. It will auto execute when route match. And receive `[req, res, params...]`. Otherwise, it will call `notfound` as fallback. Params will be `[req, res, data, params...]`. A sample file `sample/http.js` is provided.

TODO
----

* Insert path and match path.
* Solve memory leak.

[r3]:https://github.com/c9s/r3
