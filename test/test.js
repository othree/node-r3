/*global describe: false, it: false, after: false */
var should = require('should');
require('mocha');

var Router = require('../');

var router = Router.new({
  "/foo": "/foo",
  "/foo/{id}": "/foo/[data]",
  "/bar/{uid}/{post_id}": "/bar/[data]/[data]",
  "PUT /getme": "/getme[post]",
  "POST /getme": "/getme[post]",
  "GET /getme": "/getme[get]",
  "PUT /ugetme": "/getme[post]",
  "POST /ugetme": "/getme[post]",
  "GET /ugetme": "/getme[get]",
});

describe('node-r3', function () {
  "use strict";

  var dispatch;

  it('string route', function () {
    dispatch = router.match('/foo');
    dispatch[0].should.equal('/foo');
  });
  it('unmatch', function () {
    dispatch = (router.match('/bar') === undefined).should.be.ok;
    dispatch = (router.match('/bar/xd') === undefined).should.be.ok;
  });

  it('capture', function () {
    dispatch = router.match('/foo/12345');
    dispatch[0].should.equal('/foo/[data]');
    dispatch[1][0].should.equal('12345');

    dispatch = router.match('/bar/othree/54321');
    dispatch[0].should.equal('/bar/[data]/[data]');
    dispatch[1][0].should.equal('othree');
    dispatch[1][1].should.equal('54321');
  });

  it('condition', function () {
    dispatch = router.match('GET /getme');
    dispatch[0].should.equal('/getme[get]');

    dispatch = router.match('POST /getme');
    dispatch[0].should.equal('/getme[post]');
  });

  it('condition on pathnode', function () {
    dispatch = router.match('GET /foo');
    dispatch[0].should.equal('/foo');
  });

  after(function () {
    router.free();
  });
});

