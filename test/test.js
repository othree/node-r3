var should = require('should');
require('mocha');


var Router = require('../');

var router = Router.new({
  "/foo": "/foo",
  "/foo/{id}": "/foo/[data]",
  "/bar/{uid}/{post_id}": "/bar/[data]/[data]",
});

describe('node-r3', function () {
  "use strict";

  var dispatch;

  it('string route', function () {
    dispatch = router.match('/foo');
    dispatch[0].should.equal('/foo');
  });
  it('unmatch', function () {
    (router.match('/bar') === undefined).should.be.ok;
    (router.match('/bar/xd') === undefined).should.be.ok;
  });
  it('capture', function () {
    dispatch = router.match('/foo/12345');
    dispatch[0].should.equal('/foo/[data]');

    dispatch = router.match('/bar/othree/54321');
    dispatch[0].should.equal('/bar/[data]/[data]');
  });

  after(function () {
    router.free();
  });
});

