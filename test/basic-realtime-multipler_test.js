'use strict';

var basic_realtime_multipler = require('../lib/basic-realtime-multipler.js');

var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));

    })
  })
})



define(['isolate!path/to/module.under.test'], function(moduleUnderTest) {
  var dependency;
  dependency = moduleUnderTest.dependencies['path/to/dependency'];
  return dependency.someMethod();
});


describe('basic_realtime_multipler', function(){
  describe('#awesome()', function(){
    it('should return', function(){
      assert.equal(true, basic_realtime_multipler.awesome());
    })
  })
})