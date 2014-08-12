node-r3
=======

Node.js [r3][r3] binding.

[![Build Status](https://travis-ci.org/othree/node-r3.svg?branch=master)](https://travis-ci.org/othree/node-r3)

Install
-------

Compile and install [r3][r3] follow its readme. Then `npm install node-r3`.

On Mac OSX, using homebrew:

    brew install r3

Usage
-----

Basic usage:

```js
var Router = require('node-r3').Router;

var router = new Router({
  "/foo": "data string",
  "/foo/bar": function () {},
  "/foo/bar/qoo": {obj: 1},
});

var dispatched = router.match("/foo");

router.free();
```

The router's initial argument is an POJSO(Plain Old JavaScript Object). Key is route path and value is data. It is possible to add method condition in route, ex: `GET /foo`. And all JS data type can be used for data. Method condition can support 3 format.

1. Single method, ex: `GET`, `POST`.
2. Multiple method. Both `,` and `|` can be used as separator. Ex: `GET,POST` or `POST|PUT`.  
   No space allowed.
3. Integer in string, ex: `1`, `4`. Usefule for custom router application. Don't support multiple method in this format. You should deal with it before send to Router. Ex: `[1 | 4, '/foo'].join(' ')`

There is a http handler helper function:

```js
var router = new Router({
  "/": handler,
  "/foo": fooHandler,
  "/foo/{id}": fooHandler,
  "POST /me": postMeHandler,
  "GET /me": getMeHandler,
  "POST|GET /post": postHandler,
});

var server = http.createServer(router.httpHandler(notfound));
```

If the data is a function. It will auto execute when route match. And receive `[req, res, params...]`. Otherwise, it will call `notfound` as fallback. Arguments will be `[req, res, data, params...]`. A sample file `sample/http.js` is provided.

Path and Router
---------------

There are two router method on r3. One is path, one is route. The paths function is very basic. No condition, only string routing. The route  is much powerful. Supports methods condition. So its the default one in node-r3. If you want to use path router as default. Try `var Router = require('node-r3').PathRouter`. It still possible to use route function in a PathRouter. User `insert_route` and `match_route` instead of the default `insert` and `match` method. Remember to recompile the Router before use it.

API
---

Constructor:

* `Router(router config)`
* `PathRouter(router config)`

Router methods:

* `compile() -> void`
* `dump() -> void`
* `free() -> void`
* `insert(route or path, data) -> void`
* `insert_route(route, data) -> void`
* `insert_path(path, data) -> void`
* `match(route or path) -> [data, [captures]]`
* `match_route(route) -> [data, [captures]]`
* `match_path(path) -> [data, [captures]]`
* `httpHandler(handler) -> function`

Path is just a string, route is more powerful, format:

    "#{METHODS} #{PATH}"

Methods formats:

    "METHOD"
    "METHOD1|METHOD2"
    "METHOD1,METHOD2"
    "3"

Method includes:

* `GET`
* `POST`
* `PUT`
* `DELETE`
* `PATCH`
* `HEAD`
* `OPTIONS`

Router config:

    {
        "#{ROUTE1}": data1,
        "#{ROUTE2}": data2,
        "#{ROUTE3}": data3,
    }

Data can be any JavaScript data type. If data is function. When use `httpHandler`. It will auto execute data function when matched. The arguments:

    dataFunction(req, res, captures...)
    
If data is not function, `httpHandler` will execute `handler` function. And with following arguments:

    handler(req, res, data, captures...)
    
In `httpHandler`, when no route matches. `handler` will will execute also. But without data and captures.

    handler(req, res)
    

Alternative
-----------

There is another [caasi/node-r3][] projetc use different approach to let node can use r3's feature

[caasi/node-r3]:https://github.com/caasi/node-r3

TODO
----

* Solve memory leak.

[r3]:https://github.com/c9s/r3
