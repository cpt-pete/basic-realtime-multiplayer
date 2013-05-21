/*jshint -W079 */
/*global define, module, require: true */

// some functionality from bonsai https://github.com/uxebu/bonsai/blob/master/src/point.js

if (typeof define !== 'function') {  var define = require('amdefine')(module); }

define(["./math-functions"],
function(math) {
  'use strict'; 

  var sqrt = Math.sqrt; 

  function Point(x, y) { 
    this.x = x || 0;
    this.y = y || 0;
  }  

  var proto = Point.prototype;

  proto.clone = function(){
    return new Point(this.x, this.y);
  };

  proto.nill = function(){
    this.x = 0;
    this.y = 0;
    return this;
  };

  proto.equals = function(toCompare) {
    return this.x === toCompare.x && this.y === toCompare.y;
  };

  proto.add = function(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  };

  proto.multiply = function(f) {
    this.x *= f;
    this.y *= f;
    return this;
  }; 

  proto.set = function(obj) {
    this.x = obj.x;
    this.y = obj.y;
    return this;
  }; 

  proto.toFixed = function(n){    
    var places = n || 3;
    this.x = math.toFixed(this.x, places);
    this.y = math.toFixed(this.y, places);
    return this;
  };

  proto.floor = function(){
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  },

  proto.toObject = function() {
    return {
      x: this.x,
      y: this.y 
    };
  };

   proto.toString = function() {
    return "x:"+this.x+",y:"+this.y;
   };

  proto.distance = function(toPoint) {
    var hside = this.x - toPoint.x;
    var vside = this.y - toPoint.y;
    return sqrt(hside * hside + vside * vside);
  };

  Point.lerp = function(pt1, pt2, f) {
    return pt1.clone().multiply(1-f).add(pt2.clone().multiply(f));
  };

  return Point;
 
});