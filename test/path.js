/*global describe: false, it: false, after: false */
var should = require('should');
require('mocha');

var Router = require('../').PathRouter;

var router = new Router({
  "/foo": "/foo",
  "/foo/{id}": "/foo/[data]",
  "/bar/{uid}/{post_id}": "/bar/[data]/[data]",
});

describe('node-r3', function () {
  "use strict";

  var dispatch;

  it('path: string route', function () {
    dispatch = router.match('/foo');
    dispatch[0].should.equal('/foo');
  });
  it('path: unmatch', function () {
    dispatch = (router.match('/bar') === undefined).should.be.ok;
    dispatch = (router.match('/bar/xd') === undefined).should.be.ok;
  });

  it('path: capture', function () {
    dispatch = router.match('/foo/12345');
    dispatch[0].should.equal('/foo/[data]');
    dispatch[1][0].should.equal('12345');

    dispatch = router.match('/bar/othree/54321');
    dispatch[0].should.equal('/bar/[data]/[data]');
    dispatch[1][0].should.equal('othree');
    dispatch[1][1].should.equal('54321');
  });

  after(function () {
    router.free();
  });
});

